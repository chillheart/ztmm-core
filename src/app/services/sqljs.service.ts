import { Injectable } from '@angular/core';
import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';

// IndexedDB schema for storing the SQLite database
interface ZtmmDB extends DBSchema {
  database: {
    key: string;
    value: {
      name: string;
      data: Uint8Array;
      lastModified: number;
    };
  };
  backups: {
    key: string;
    value: {
      name: string;
      data: Uint8Array;
      timestamp: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class SqlJsService {
  private sql: SqlJsStatic | null = null;
  private db: Database | null = null;
  private idbConnection: IDBPDatabase<ZtmmDB> | null = null;
  private isInitialized = false;

  // Database schema - same as the Electron version
  private readonly schema = `
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
        FOREIGN KEY(pillar_id) REFERENCES pillars(id),
        UNIQUE(name, type, pillar_id)
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

    INSERT OR IGNORE INTO pillars (name, order_index) VALUES
        ('Identity', 1),
        ('Devices', 2),
        ('Networks', 3),
        ('Applications & Workloads', 4),
        ('Data', 5);

    -- Insert default function capabilities for each pillar
    INSERT OR IGNORE INTO function_capabilities (name, type, pillar_id, order_index) VALUES
        -- Identity pillar functions and capabilities
        ('Authentication', 'Function', 1, 1),
        ('Identity Stores', 'Function', 1, 2),
        ('Risk Assessments', 'Function', 1, 3),
        ('Access Management', 'Function', 1, 4),
        ('Visibility & Analytics', 'Capability', 1, 5),
        ('Automation & Orchestration', 'Capability', 1, 6),
        ('Governance', 'Capability', 1, 7),

        -- Devices pillar functions and capabilities
        ('Policy Enforcement & Compliance Monitoring', 'Function', 2, 8),
        ('Asset & Supply Chain Risk Management', 'Function', 2, 9),
        ('Resource Access', 'Function', 2, 10),
        ('Device Threat Protection', 'Function', 2, 11),
        ('Visibility & Analytics', 'Capability', 2, 12),
        ('Automation & Orchestration', 'Capability', 2, 13),
        ('Governance', 'Capability', 2, 14),

        -- Networks pillar functions and capabilities
        ('Network Segmentation', 'Function', 3, 15),
        ('Network Traffic Management', 'Function', 3, 16),
        ('Traffic Encryption', 'Function', 3, 17),
        ('Network Resilience', 'Function', 3, 18),
        ('Visibility & Analytics', 'Capability', 3, 19),
        ('Automation & Orchestration', 'Capability', 3, 20),
        ('Governance', 'Capability', 3, 21),

        -- Applications & Workloads pillar functions and capabilities
        ('Application Access', 'Function', 4, 22),
        ('Application Threat Protections', 'Function', 4, 23),
        ('Accessible Applications', 'Function', 4, 24),
        ('Secure Application Development & Deployment Workflow', 'Function', 4, 25),
        ('Application Security Testing', 'Function', 4, 26),
        ('Visibility & Analytics', 'Capability', 4, 27),
        ('Automation & Orchestration', 'Capability', 4, 28),
        ('Governance', 'Capability', 4, 29),

        -- Data pillar functions and capabilities
        ('Data Inventory', 'Function', 5, 30),
        ('Data Categorization', 'Function', 5, 31),
        ('Data Availability', 'Function', 5, 32),
        ('Data Access', 'Function', 5, 33),
        ('Data Encryption', 'Function', 5, 34),
        ('Visibility & Analytics', 'Capability', 5, 35),
        ('Automation & Orchestration', 'Capability', 5, 36),
        ('Governance', 'Capability', 5, 37);
  `;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Initialize SQL.js
      this.sql = await initSqlJs({
        // Load the wasm file from node_modules
        locateFile: (file: string) => {
          if (file.endsWith('.wasm')) {
            return `/assets/sql-wasm.wasm`;
          }
          return file;
        }
      });

      // Initialize IndexedDB
      this.idbConnection = await openDB<ZtmmDB>('ztmm-database', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('database')) {
            db.createObjectStore('database');
          }
          if (!db.objectStoreNames.contains('backups')) {
            db.createObjectStore('backups');
          }
        },
      });

      // Load existing database or create new one
      await this.loadOrCreateDatabase();

      this.isInitialized = true;
      console.log('SQL.js database service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize SQL.js service:', error);
      throw new Error('Database initialization failed');
    }
  }

  private async loadOrCreateDatabase(): Promise<void> {
    if (!this.sql || !this.idbConnection) {
      throw new Error('SQL.js not initialized');
    }

    try {
      // Try to load existing database from IndexedDB
      const existingDb = await this.idbConnection.get('database', 'main');

      if (existingDb && existingDb.data) {
        console.log('Loading existing database from IndexedDB');
        this.db = new this.sql.Database(existingDb.data);

        // Apply schema (idempotent table creation and default data insertion)
        this.db.exec(this.schema);

        // Save database after applying schema defaults
        await this.saveDatabase();
      } else {
        console.log('Creating new database');
        this.db = new this.sql.Database();

        // Create tables and initial data
        this.db.exec(this.schema);

        // Save the new database
        await this.saveDatabase();
      }
    } catch (error) {
      console.error('Error loading/creating database:', error);
      // Create a new database as fallback
      this.db = new this.sql.Database();
      this.db.exec(this.schema);
      await this.saveDatabase();
    }
  }

  private async saveDatabase(): Promise<void> {
    if (!this.db || !this.idbConnection) {
      throw new Error('Database not initialized');
    }

    try {
      const data = this.db.export();
      await this.idbConnection.put('database', {
        name: 'main',
        data,
        lastModified: Date.now()
      }, 'main');

      console.log('Database saved to IndexedDB');
    } catch (error) {
      console.error('Failed to save database:', error);
      throw new Error('Database save failed');
    }
  }

  public async executeQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const stmt = this.db!.prepare(sql);
      const results: T[] = [];

      while (stmt.step()) {
        const row = stmt.getAsObject();
        results.push(row as T);
      }

      stmt.free();
      return results;
    } catch (error) {
      console.error('Query execution failed:', error, { sql, params });
      throw new Error(`Database query failed: ${error}`);
    }
  }

  private async executeUpdate(sql: string, params: any[] = []): Promise<{ lastInsertRowid: number; changes: number }> {
    if (!this.db) {
      await this.initialize();
    }

    try {
      const stmt = this.db!.prepare(sql);
      stmt.run(params);
      stmt.free();

      // Save database after modifications
      await this.saveDatabase();

      return {
        lastInsertRowid: this.db!.exec("SELECT last_insert_rowid()")[0]?.values[0][0] as number || 0,
        changes: 1 // SQL.js doesn't provide this info, so we assume 1 row affected
      };
    } catch (error) {
      console.error('Update execution failed:', error, { sql, params });
      throw new Error(`Database update failed: ${error}`);
    }
  }

  // Pillar operations
  async getPillars(): Promise<Pillar[]> {
    return this.executeQuery<Pillar>('SELECT * FROM pillars ORDER BY order_index ASC, id ASC');
  }

  async addPillar(name: string): Promise<void> {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Pillar name is required');
    }
    if (name.length > 255) {
      throw new Error('Pillar name cannot exceed 255 characters');
    }

    await this.executeUpdate('INSERT INTO pillars (name) VALUES (?)', [name.trim()]);
  }

  async removePillar(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid pillar ID');
    }

    // Use transaction for cascading deletes with proper parameterized queries
    if (!this.db) await this.initialize();

    try {
      // Remove all assessment responses for technologies/processes under this pillar
      await this.executeUpdate(`
        DELETE FROM assessment_responses
        WHERE tech_process_id IN (
          SELECT tp.id FROM technologies_processes tp
          JOIN function_capabilities fc ON tp.function_capability_id = fc.id
          WHERE fc.pillar_id = ?
        )
      `, [id]);

      // Remove all technologies/processes under this pillar
      await this.executeUpdate(`
        DELETE FROM technologies_processes
        WHERE function_capability_id IN (
          SELECT id FROM function_capabilities WHERE pillar_id = ?
        )
      `, [id]);

      // Remove all function capabilities under this pillar
      await this.executeUpdate('DELETE FROM function_capabilities WHERE pillar_id = ?', [id]);

      // Remove the pillar
      await this.executeUpdate('DELETE FROM pillars WHERE id = ?', [id]);

      await this.saveDatabase();
    } catch (error) {
      if (this.db) {
        this.db.exec('ROLLBACK;');
      }
      throw error;
    }
  }

  async editPillar(id: number, name: string): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid pillar ID');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Pillar name is required');
    }

    await this.executeUpdate('UPDATE pillars SET name = ? WHERE id = ?', [name.trim(), id]);
  }

  async savePillarOrder(order: number[]): Promise<void> {
    if (!Array.isArray(order) || order.length === 0) {
      throw new Error('Invalid order array');
    }

    for (let i = 0; i < order.length; i++) {
      await this.executeUpdate('UPDATE pillars SET order_index = ? WHERE id = ?', [i, order[i]]);
    }
  }

  // Function Capability operations
  async getFunctionCapabilities(): Promise<FunctionCapability[]> {
    return this.executeQuery<FunctionCapability>('SELECT * FROM function_capabilities ORDER BY order_index ASC, id ASC');
  }

  async addFunctionCapability(name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    if (!name || name.trim().length === 0) {
      throw new Error('Function/Capability name is required');
    }
    if (!['Function', 'Capability'].includes(type)) {
      throw new Error('Type must be either Function or Capability');
    }
    if (!Number.isInteger(pillarId) || pillarId < 1) {
      throw new Error('Invalid pillar ID');
    }

    await this.executeUpdate(
      'INSERT INTO function_capabilities (name, type, pillar_id) VALUES (?, ?, ?)',
      [name.trim(), type, pillarId]
    );
  }

  async removeFunctionCapability(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid function capability ID');
    }

    if (!this.db) await this.initialize();

    try {
      // Remove assessment responses for technologies/processes under this function capability
      await this.executeUpdate(`
        DELETE FROM assessment_responses
        WHERE tech_process_id IN (
          SELECT id FROM technologies_processes WHERE function_capability_id = ?
        )
      `, [id]);

      // Remove technologies/processes under this function capability
      await this.executeUpdate('DELETE FROM technologies_processes WHERE function_capability_id = ?', [id]);

      // Remove the function capability
      await this.executeUpdate('DELETE FROM function_capabilities WHERE id = ?', [id]);
    } catch (error) {
      if (this.db) {
        this.db.exec('ROLLBACK;');
      }
      throw error;
    }
  }

  async editFunctionCapability(id: number, name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid function capability ID');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Function/Capability name is required');
    }
    if (!['Function', 'Capability'].includes(type)) {
      throw new Error('Type must be either Function or Capability');
    }
    if (!Number.isInteger(pillarId) || pillarId < 1) {
      throw new Error('Invalid pillar ID');
    }

    await this.executeUpdate(
      'UPDATE function_capabilities SET name = ?, type = ?, pillar_id = ? WHERE id = ?',
      [name.trim(), type, pillarId, id]
    );
  }

  async saveFunctionOrder(order: number[]): Promise<void> {
    if (!Array.isArray(order) || order.length === 0) {
      throw new Error('Invalid order array');
    }

    for (let i = 0; i < order.length; i++) {
      await this.executeUpdate('UPDATE function_capabilities SET order_index = ? WHERE id = ?', [i, order[i]]);
    }
  }

  // Maturity Stage operations
  async getMaturityStages(): Promise<MaturityStage[]> {
    return this.executeQuery<MaturityStage>('SELECT * FROM maturity_stages');
  }

  // Technology Process operations
  async getTechnologiesProcesses(functionCapabilityId?: number): Promise<TechnologyProcess[]> {
    if (functionCapabilityId !== undefined) {
      return this.executeQuery<TechnologyProcess>(
        'SELECT * FROM technologies_processes WHERE function_capability_id = ?',
        [functionCapabilityId]
      );
    } else {
      return this.executeQuery<TechnologyProcess>('SELECT * FROM technologies_processes');
    }
  }

  async getAllTechnologiesProcesses(): Promise<TechnologyProcess[]> {
    return this.executeQuery<TechnologyProcess>('SELECT * FROM technologies_processes');
  }

  async getTechnologiesProcessesByFunction(functionCapabilityId: number): Promise<TechnologyProcess[]> {
    if (!Number.isInteger(functionCapabilityId) || functionCapabilityId < 1) {
      throw new Error('Invalid function capability ID');
    }
    return this.executeQuery<TechnologyProcess>(
      'SELECT * FROM technologies_processes WHERE function_capability_id = ?',
      [functionCapabilityId]
    );
  }

  async addTechnologyProcess(description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    if (!description || description.trim().length === 0) {
      throw new Error('Technology/Process description is required');
    }
    if (description.length > 500) {
      throw new Error('Description cannot exceed 500 characters');
    }
    if (!['Technology', 'Process'].includes(type)) {
      throw new Error('Type must be either Technology or Process');
    }
    if (!Number.isInteger(functionCapabilityId) || functionCapabilityId < 1) {
      throw new Error('Invalid function capability ID');
    }
    if (!Number.isInteger(maturityStageId) || maturityStageId < 1) {
      throw new Error('Invalid maturity stage ID');
    }

    await this.executeUpdate(
      'INSERT INTO technologies_processes (description, type, function_capability_id, maturity_stage_id) VALUES (?, ?, ?, ?)',
      [description.trim(), type, functionCapabilityId, maturityStageId]
    );
  }

  async removeTechnologyProcess(id: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid technology process ID');
    }

    if (!this.db) await this.initialize();

    try {
      // Remove assessment responses for this technology process
      await this.executeUpdate('DELETE FROM assessment_responses WHERE tech_process_id = ?', [id]);

      // Remove the technology process
      await this.executeUpdate('DELETE FROM technologies_processes WHERE id = ?', [id]);
    } catch (error) {
      if (this.db) {
        this.db.exec('ROLLBACK;');
      }
      throw error;
    }
  }

  async editTechnologyProcess(id: number, description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid technology process ID');
    }
    if (!description || description.trim().length === 0) {
      throw new Error('Technology/Process description is required');
    }
    if (!['Technology', 'Process'].includes(type)) {
      throw new Error('Type must be either Technology or Process');
    }
    if (!Number.isInteger(functionCapabilityId) || functionCapabilityId < 1) {
      throw new Error('Invalid function capability ID');
    }
    if (!Number.isInteger(maturityStageId) || maturityStageId < 1) {
      throw new Error('Invalid maturity stage ID');
    }

    await this.executeUpdate(
      'UPDATE technologies_processes SET description = ?, type = ?, function_capability_id = ?, maturity_stage_id = ? WHERE id = ?',
      [description.trim(), type, functionCapabilityId, maturityStageId, id]
    );
  }

  // Assessment operations
  async saveAssessment(techProcessId: number, status: AssessmentStatus, notes?: string): Promise<void> {
    if (!Number.isInteger(techProcessId) || techProcessId < 1) {
      throw new Error('Invalid technology process ID');
    }
    const validStatuses: AssessmentStatus[] = ['Not Implemented', 'Partially Implemented', 'Fully Implemented'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid assessment status');
    }
    if (notes && notes.length > 2000) {
      throw new Error('Notes cannot exceed 2000 characters');
    }

    // First delete any existing assessment
    await this.executeUpdate('DELETE FROM assessment_responses WHERE tech_process_id = ?', [techProcessId]);

    // Then insert the new assessment
    await this.executeUpdate(
      'INSERT INTO assessment_responses (tech_process_id, status, notes) VALUES (?, ?, ?)',
      [techProcessId, status, notes || null]
    );
  }

  async getAssessmentResponses(): Promise<AssessmentResponse[]> {
    return this.executeQuery<AssessmentResponse>('SELECT * FROM assessment_responses');
  }

  // Utility operations
  async exportDatabase(): Promise<Uint8Array> {
    if (!this.db) {
      await this.initialize();
    }
    return this.db!.export();
  }

  async importDatabase(data: Uint8Array): Promise<void> {
    if (!this.sql) {
      await this.initialize();
    }

    try {
      // Create backup before importing
      await this.createBackup();

      // Load the imported database
      this.db = new this.sql!.Database(data);

      // Save to IndexedDB
      await this.saveDatabase();

      console.log('Database imported successfully');
    } catch (error) {
      console.error('Database import failed:', error);
      throw new Error('Failed to import database');
    }
  }

  async createBackup(): Promise<void> {
    if (!this.db || !this.idbConnection) {
      return;
    }

    const data = this.db.export();
    const timestamp = Date.now();

    await this.idbConnection.put('backups', {
      name: `backup_${timestamp}`,
      data,
      timestamp
    }, `backup_${timestamp}`);

    console.log('Database backup created');
  }

  async getBackups(): Promise<{ name: string; timestamp: number }[]> {
    if (!this.idbConnection) {
      await this.initialize();
    }

    const backups: { name: string; timestamp: number }[] = [];
    const tx = this.idbConnection!.transaction('backups', 'readonly');
    const store = tx.objectStore('backups');

    for await (const cursor of store) {
      backups.push({
        name: cursor.value.name,
        timestamp: cursor.value.timestamp
      });
    }

    return backups.sort((a, b) => b.timestamp - a.timestamp);
  }

  async restoreBackup(backupName: string): Promise<void> {
    if (!this.idbConnection) {
      await this.initialize();
    }

    const backup = await this.idbConnection!.get('backups', backupName);
    if (!backup) {
      throw new Error('Backup not found');
    }

    await this.importDatabase(backup.data);
  }

  async clearAllData(): Promise<void> {
    await this.initialize();

    try {
      // Clear all data in proper order due to foreign key constraints
      // Start with dependent tables first
      await this.executeUpdate('DELETE FROM assessment_responses');
      await this.executeUpdate('DELETE FROM technologies_processes');
      await this.executeUpdate('DELETE FROM function_capabilities');

      // Clear only user-added pillars, keep the default ones
      await this.executeUpdate(`DELETE FROM pillars WHERE name NOT IN (
        'Identity', 'Devices', 'Networks', 'Applications & Workloads', 'Data'
      )`);

      // Note: We keep maturity_stages and default pillars as they are foundational data

      await this.saveDatabase();
      console.log('All user data cleared successfully (default pillars preserved)');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      console.log('Starting complete database reset...');

      // Close the current database connection if it exists
      if (this.db) {
        this.db.close();
        this.db = null;
      }

      // Clear the database from IndexedDB completely
      if (!this.idbConnection) {
        await this.initialize();
      }

      // Delete the main database from IndexedDB
      await this.idbConnection!.delete('database', 'main');
      console.log('Database deleted from IndexedDB');

      // Reset initialization flag to force re-initialization
      this.isInitialized = false;

      // Create a completely new database with fresh schema and default data
      this.db = new this.sql!.Database();
      this.db.exec(this.schema);

      // Save the new database to IndexedDB
      await this.saveDatabase();

      console.log('Database completely reset and reinitialized successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw new Error(`Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async importDataWithPreservedIds(data: any): Promise<void> {
    await this.initialize();

    try {
      console.log('Starting import with preserved IDs...');

      // Clear all existing data first (but keep schema)
      await this.executeUpdate('DELETE FROM assessment_responses');
      await this.executeUpdate('DELETE FROM technologies_processes');
      await this.executeUpdate('DELETE FROM function_capabilities');
      await this.executeUpdate('DELETE FROM pillars');
      await this.executeUpdate('DELETE FROM maturity_stages');

      // Import in dependency order with preserved IDs

      // 1. Maturity Stages (independent)
      if (data.maturityStages && Array.isArray(data.maturityStages)) {
        for (const ms of data.maturityStages) {
          await this.executeUpdate(
            'INSERT INTO maturity_stages (id, name) VALUES (?, ?)',
            [ms.id, ms.name]
          );
        }
      }

      // 2. Pillars (independent)
      if (data.pillars && Array.isArray(data.pillars)) {
        for (const pillar of data.pillars) {
          await this.executeUpdate(
            'INSERT INTO pillars (id, name, order_index) VALUES (?, ?, ?)',
            [pillar.id, pillar.name, pillar.order_index || null]
          );
        }
      }

      // 3. Function Capabilities (depend on pillars)
      if (data.functionCapabilities && Array.isArray(data.functionCapabilities)) {
        for (const fc of data.functionCapabilities) {
          await this.executeUpdate(
            'INSERT INTO function_capabilities (id, name, type, pillar_id, order_index) VALUES (?, ?, ?, ?, ?)',
            [fc.id, fc.name, fc.type, fc.pillar_id, fc.order_index || null]
          );
        }
      }

      // 4. Technologies/Processes (depend on function capabilities and maturity stages)
      if (data.technologiesProcesses && Array.isArray(data.technologiesProcesses)) {
        for (const tp of data.technologiesProcesses) {
          await this.executeUpdate(
            'INSERT INTO technologies_processes (id, description, type, function_capability_id, maturity_stage_id) VALUES (?, ?, ?, ?, ?)',
            [tp.id, tp.description, tp.type, tp.function_capability_id, tp.maturity_stage_id]
          );
        }
      }

      // 5. Assessment Responses (depend on everything else)
      if (data.assessmentResponses && Array.isArray(data.assessmentResponses)) {
        for (const ar of data.assessmentResponses) {
          await this.executeUpdate(
            'INSERT INTO assessment_responses (id, tech_process_id, status, notes) VALUES (?, ?, ?, ?)',
            [ar.id, ar.tech_process_id, ar.status, ar.notes || null]
          );
        }
      }

      await this.saveDatabase();
      console.log('Import with preserved IDs completed successfully');
    } catch (error) {
      console.error('Error importing data with preserved IDs:', error);
      throw new Error(`Failed to import data with preserved IDs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
