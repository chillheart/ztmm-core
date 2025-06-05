const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

// Simple development mode detection to replace electron-is-dev
const isDev = process.env.NODE_ENV === 'development' || process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath);

let mainWindow;

// Get the appropriate user data directory and create ZTMMAssessment subdirectory
const userDataPath = app.getPath('userData');
const appDataPath = path.join(userDataPath, 'ZTMMAssessment');
let dbPath;

if (isDev) {
  dbPath = path.join(__dirname, 'ztmm.db'); // Use a local database for development
  console.log('Database path:', dbPath);
} else {
  // In production, use the app's executable directory for the database
  dbPath = path.join(appDataPath, 'ztmm.db');
  // Ensure the ZTMMAssessment directory exists
  if (!fs.existsSync(appDataPath)) {
    fs.mkdirSync(appDataPath, { recursive: true });
  }
}

const db = new Database(dbPath);

// Initialize DB schema
const schema = `
  CREATE TABLE IF NOT EXISTS pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      order_index INTEGER
  );

  CREATE TABLE IF NOT EXISTS function_capabilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT CHECK(type IN ('Function', 'Capability')) NOT NULL,
      pillar_id INTEGER NOT NULL,
      order_index INTEGER,
      FOREIGN KEY(pillar_id) REFERENCES pillars(id)
  );

  CREATE TABLE IF NOT EXISTS maturity_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS technologies_processes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      type TEXT CHECK(type IN ('Technology', 'Process')) NOT NULL DEFAULT 'Technology',
      function_capability_id INTEGER NOT NULL,
      maturity_stage_id INTEGER NOT NULL,
      FOREIGN KEY(function_capability_id) REFERENCES function_capabilities(id),
      FOREIGN KEY(maturity_stage_id) REFERENCES maturity_stages(id)
  );

  CREATE TABLE IF NOT EXISTS assessment_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tech_process_id INTEGER NOT NULL,
      status TEXT CHECK(status IN ('Not Implemented', 'Partially Implemented', 'Fully Implemented')) NOT NULL,
      notes TEXT,
      FOREIGN KEY(tech_process_id) REFERENCES technologies_processes(id)
  );

  INSERT OR IGNORE INTO maturity_stages (name) VALUES
      ('Traditional'),
      ('Initial'),
      ('Advanced'),
      ('Optimal');
`;
db.exec(schema);

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      allowRunningInsecureContent: false
    }
  });

  // Load from development server if in dev mode, otherwise load built files
  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    console.log('Loading index.html from:', indexPath);

    // Check if file exists
    const fs = require('fs');
    if (!fs.existsSync(indexPath)) {
      console.error('Index.html not found at:', indexPath);
      return;
    }

    // Use loadFile which properly sets up the origin for ES modules
    mainWindow.loadFile(indexPath).then(() => {
      console.log('Successfully loaded index.html');
    }).catch(error => {
      console.error('Failed to load index.html with loadFile:', error);
    });

    // Add error handling for renderer process
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
      console.error('Page failed to load:', {
        errorCode,
        errorDescription,
        validatedURL
      });
    });

    // Listen for console messages from renderer
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`Renderer console [${level}]:`, message, `at ${sourceId}:${line}`);
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('getPillars', () => {
    return db.prepare('SELECT * FROM pillars ORDER BY order_index ASC, id ASC').all();
  });

  ipcMain.handle('addPillar', (event, name) => {
    db.prepare('INSERT INTO pillars (name) VALUES (?)').run(name);
  });

  ipcMain.handle('getFunctionCapabilities', () => {
    return db.prepare('SELECT * FROM function_capabilities ORDER BY order_index ASC, id ASC').all();
  });

  ipcMain.handle('addFunctionCapability', (event, name, type, pillarId) => {
    db.prepare('INSERT INTO function_capabilities (name, type, pillar_id) VALUES (?, ?, ?)').run(name, type, pillarId);
  });

  ipcMain.handle('getMaturityStages', () => {
    return db.prepare('SELECT * FROM maturity_stages').all();
  });

  ipcMain.handle('getTechnologiesProcesses', (event, functionCapabilityId) => {
    return db.prepare('SELECT * FROM technologies_processes WHERE function_capability_id = ?').all(functionCapabilityId);
  });

  ipcMain.handle('addTechnologyProcess', (event, description, type, functionCapabilityId, maturityStageId) => {
    db.prepare('INSERT INTO technologies_processes (description, type, function_capability_id, maturity_stage_id) VALUES (?, ?, ?, ?)').run(description, type, functionCapabilityId, maturityStageId);
  });

  ipcMain.handle('saveAssessment', (event, techProcessId, status, notes) => {
    // First delete any existing assessment for this tech/process
    db.prepare('DELETE FROM assessment_responses WHERE tech_process_id = ?').run(techProcessId);
    // Then insert the new assessment
    db.prepare('INSERT INTO assessment_responses (tech_process_id, status, notes) VALUES (?, ?, ?)').run(techProcessId, status, notes);
  });

  ipcMain.handle('getAssessmentResponses', () => {
    return db.prepare('SELECT * FROM assessment_responses').all();
  });

  ipcMain.handle('removePillar', (event, id) => {
    // Remove all function_capabilities and their technologies_processes and assessment_responses for this pillar
    const fcRows = db.prepare('SELECT id FROM function_capabilities WHERE pillar_id = ?').all(id);
    for (const fc of fcRows) {
      // Remove all technologies_processes and their assessment_responses for this function_capability
      const tpRows = db.prepare('SELECT id FROM technologies_processes WHERE function_capability_id = ?').all(fc.id);
      for (const tp of tpRows) {
        db.prepare('DELETE FROM assessment_responses WHERE tech_process_id = ?').run(tp.id);
      }
      db.prepare('DELETE FROM technologies_processes WHERE function_capability_id = ?').run(fc.id);
      db.prepare('DELETE FROM function_capabilities WHERE id = ?').run(fc.id);
    }
    db.prepare('DELETE FROM pillars WHERE id = ?').run(id);
  });

  ipcMain.handle('removeFunctionCapability', (event, id) => {
    // Remove all technologies_processes and their assessment_responses for this function_capability
    const tpRows = db.prepare('SELECT id FROM technologies_processes WHERE function_capability_id = ?').all(id);
    for (const tp of tpRows) {
      db.prepare('DELETE FROM assessment_responses WHERE tech_process_id = ?').run(tp.id);
    }
    db.prepare('DELETE FROM technologies_processes WHERE function_capability_id = ?').run(id);
    db.prepare('DELETE FROM function_capabilities WHERE id = ?').run(id);
  });

  ipcMain.handle('removeTechnologyProcess', (event, id) => {
    // Remove all assessment_responses for this technology_process
    db.prepare('DELETE FROM assessment_responses WHERE tech_process_id = ?').run(id);
    db.prepare('DELETE FROM technologies_processes WHERE id = ?').run(id);
  });

  ipcMain.handle('savePillarOrder', (event, order) => {
    order.forEach((id, idx) => {
      db.prepare('UPDATE pillars SET order_index = ? WHERE id = ?').run(idx, id);
    });
  });
  ipcMain.handle('saveFunctionOrder', (event, order) => {
    order.forEach((id, idx) => {
      db.prepare('UPDATE function_capabilities SET order_index = ? WHERE id = ?').run(idx, id);
    });
  });

  ipcMain.handle('editPillar', (event, id, name) => {
    db.prepare('UPDATE pillars SET name = ? WHERE id = ?').run(name, id);
  });
  ipcMain.handle('editFunctionCapability', (event, id, name, type, pillarId) => {
    db.prepare('UPDATE function_capabilities SET name = ?, type = ?, pillar_id = ? WHERE id = ?').run(name, type, pillarId, id);
  });
  ipcMain.handle('editTechnologyProcess', (event, id, description, type, functionCapabilityId, maturityStageId) => {
    db.prepare('UPDATE technologies_processes SET description = ?, type = ?, function_capability_id = ?, maturity_stage_id = ? WHERE id = ?').run(description, type, functionCapabilityId, maturityStageId, id);
  });
});

app.on('window-all-closed', () => {
  // Quit the app when all windows are closed on all platforms
  // This ensures the app exits completely when the window is closed on macOS
  app.quit();
});

app.on('activate', () => {
  // On macOS, if the app is still running and user clicks the dock icon,
  // create a new window if none exist
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
