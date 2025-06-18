import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from '../models/ztmm.models';

// IndexedDB schema for the ZTMM Assessment application
interface ZtmmDB extends DBSchema {
  pillars: {
    key: number;
    value: Pillar & { order_index?: number };
    indexes: { 'by-order': number; 'by-name': string };
  };
  functionCapabilities: {
    key: number;
    value: FunctionCapability & { order_index?: number };
    indexes: { 'by-pillar': number; 'by-order': number };
  };
  maturityStages: {
    key: number;
    value: MaturityStage;
    indexes: { 'by-name': string };
  };
  technologiesProcesses: {
    key: number;
    value: TechnologyProcess;
    indexes: { 'by-function-capability': number; 'by-maturity-stage': number };
  };
  assessmentResponses: {
    key: number;
    value: AssessmentResponse;
    indexes: { 'by-tech-process': number };
  };
  backups: {
    key: string;
    value: {
      name: string;
      data: unknown; // Using unknown instead of any for better type safety
      timestamp: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class IndexedDBService {
  private db: IDBPDatabase<ZtmmDB> | null = null;
  private isInitialized = false;
  private dbName = 'ztmm-assessment'; // Default database name

  // For testing: allow setting a custom database name
  setDatabaseName(name: string): void {
    if (this.isInitialized) {
      throw new Error('Cannot change database name after initialization');
    }
    this.dbName = name;
  }

  // For testing: reset the service to uninitialized state
  resetService(): void {
    if (this.db) {
      this.db.close();
    }
    this.db = null;
    this.isInitialized = false;
    this.dbName = 'ztmm-assessment'; // Reset to default
  }

  // Default data to be inserted on first initialization
  private readonly defaultPillars: (Pillar & { order_index: number })[] = [
    { id: 1, name: 'Identity', order_index: 1 },
    { id: 2, name: 'Devices', order_index: 2 },
    { id: 3, name: 'Networks', order_index: 3 },
    { id: 4, name: 'Applications & Workloads', order_index: 4 },
    { id: 5, name: 'Data', order_index: 5 }
  ];

  private readonly defaultMaturityStages: MaturityStage[] = [
    { id: 1, name: 'Traditional' },
    { id: 2, name: 'Initial' },
    { id: 3, name: 'Advanced' },
    { id: 4, name: 'Optimal' }
  ];

  private readonly defaultFunctionCapabilities: (FunctionCapability & { order_index: number })[] = [
    // Identity pillar functions and capabilities
    { id: 1, name: 'Authentication', type: 'Function', pillar_id: 1, order_index: 1 },
    { id: 2, name: 'Identity Stores', type: 'Function', pillar_id: 1, order_index: 2 },
    { id: 3, name: 'Risk Assessments', type: 'Function', pillar_id: 1, order_index: 3 },
    { id: 4, name: 'Access Management', type: 'Function', pillar_id: 1, order_index: 4 },
    { id: 5, name: 'Visibility & Analytics', type: 'Capability', pillar_id: 1, order_index: 5 },
    { id: 6, name: 'Automation & Orchestration', type: 'Capability', pillar_id: 1, order_index: 6 },
    { id: 7, name: 'Governance', type: 'Capability', pillar_id: 1, order_index: 7 },

    // Devices pillar functions and capabilities
    { id: 8, name: 'Policy Enforcement & Compliance Monitoring', type: 'Function', pillar_id: 2, order_index: 8 },
    { id: 9, name: 'Asset & Supply Chain Risk Management', type: 'Function', pillar_id: 2, order_index: 9 },
    { id: 10, name: 'Resource Access', type: 'Function', pillar_id: 2, order_index: 10 },
    { id: 11, name: 'Device Threat Protection', type: 'Function', pillar_id: 2, order_index: 11 },
    { id: 12, name: 'Visibility & Analytics', type: 'Capability', pillar_id: 2, order_index: 12 },
    { id: 13, name: 'Automation & Orchestration', type: 'Capability', pillar_id: 2, order_index: 13 },
    { id: 14, name: 'Governance', type: 'Capability', pillar_id: 2, order_index: 14 },

    // Networks pillar functions and capabilities
    { id: 15, name: 'Network Segmentation', type: 'Function', pillar_id: 3, order_index: 15 },
    { id: 16, name: 'Network Traffic Management', type: 'Function', pillar_id: 3, order_index: 16 },
    { id: 17, name: 'Traffic Encryption', type: 'Function', pillar_id: 3, order_index: 17 },
    { id: 18, name: 'Network Resilience', type: 'Function', pillar_id: 3, order_index: 18 },
    { id: 19, name: 'Visibility & Analytics', type: 'Capability', pillar_id: 3, order_index: 19 },
    { id: 20, name: 'Automation & Orchestration', type: 'Capability', pillar_id: 3, order_index: 20 },
    { id: 21, name: 'Governance', type: 'Capability', pillar_id: 3, order_index: 21 },

    // Applications & Workloads pillar functions and capabilities
    { id: 22, name: 'Application Access', type: 'Function', pillar_id: 4, order_index: 22 },
    { id: 23, name: 'Application Threat Protections', type: 'Function', pillar_id: 4, order_index: 23 },
    { id: 24, name: 'Accessible Applications', type: 'Function', pillar_id: 4, order_index: 24 },
    { id: 25, name: 'Secure Application Development & Deployment Workflow', type: 'Function', pillar_id: 4, order_index: 25 },
    { id: 26, name: 'Application Security Testing', type: 'Function', pillar_id: 4, order_index: 26 },
    { id: 27, name: 'Visibility & Analytics', type: 'Capability', pillar_id: 4, order_index: 27 },
    { id: 28, name: 'Automation & Orchestration', type: 'Capability', pillar_id: 4, order_index: 28 },
    { id: 29, name: 'Governance', type: 'Capability', pillar_id: 4, order_index: 29 },

    // Data pillar functions and capabilities
    { id: 30, name: 'Data Inventory', type: 'Function', pillar_id: 5, order_index: 30 },
    { id: 31, name: 'Data Categorization', type: 'Function', pillar_id: 5, order_index: 31 },
    { id: 32, name: 'Data Availability', type: 'Function', pillar_id: 5, order_index: 32 },
    { id: 33, name: 'Data Access', type: 'Function', pillar_id: 5, order_index: 33 },
    { id: 34, name: 'Data Encryption', type: 'Function', pillar_id: 5, order_index: 34 },
    { id: 35, name: 'Visibility & Analytics', type: 'Capability', pillar_id: 5, order_index: 35 },
    { id: 36, name: 'Automation & Orchestration', type: 'Capability', pillar_id: 5, order_index: 36 },
    { id: 37, name: 'Governance', type: 'Capability', pillar_id: 5, order_index: 37 }
  ];

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Open IndexedDB with proper schema setup
      this.db = await openDB<ZtmmDB>(this.dbName, 1, {
        upgrade(db) {
          // Create object stores with indexes

          // Pillars store
          if (!db.objectStoreNames.contains('pillars')) {
            const pillarStore = db.createObjectStore('pillars', { keyPath: 'id', autoIncrement: true });
            pillarStore.createIndex('by-order', 'order_index');
            pillarStore.createIndex('by-name', 'name', { unique: true });
          }

          // Function capabilities store
          if (!db.objectStoreNames.contains('functionCapabilities')) {
            const fcStore = db.createObjectStore('functionCapabilities', { keyPath: 'id', autoIncrement: true });
            fcStore.createIndex('by-pillar', 'pillar_id');
            fcStore.createIndex('by-order', 'order_index');
          }

          // Maturity stages store
          if (!db.objectStoreNames.contains('maturityStages')) {
            const msStore = db.createObjectStore('maturityStages', { keyPath: 'id', autoIncrement: true });
            msStore.createIndex('by-name', 'name', { unique: true });
          }

          // Technologies/processes store
          if (!db.objectStoreNames.contains('technologiesProcesses')) {
            const tpStore = db.createObjectStore('technologiesProcesses', { keyPath: 'id', autoIncrement: true });
            tpStore.createIndex('by-function-capability', 'function_capability_id');
            tpStore.createIndex('by-maturity-stage', 'maturity_stage_id');
          }

          // Assessment responses store
          if (!db.objectStoreNames.contains('assessmentResponses')) {
            const arStore = db.createObjectStore('assessmentResponses', { keyPath: 'id', autoIncrement: true });
            arStore.createIndex('by-tech-process', 'tech_process_id', { unique: true });
          }

          // Backups store
          if (!db.objectStoreNames.contains('backups')) {
            db.createObjectStore('backups', { keyPath: 'name' });
          }
        }
      });

      // Initialize with default data if empty
      await this.initializeDefaultData();

      this.isInitialized = true;
      console.log('IndexedDB service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IndexedDB service:', error);
      throw new Error('Database initialization failed');
    }
  }

  private async initializeDefaultData(): Promise<void> {
    if (!this.db) return;

    try {
      // Check if we already have data
      const existingPillars = await this.db.getAll('pillars');

      if (existingPillars.length === 0) {
        console.log('Initializing with default ZTMM framework data...');

        // Insert default maturity stages
        const tx1 = this.db.transaction('maturityStages', 'readwrite');
        for (const stage of this.defaultMaturityStages) {
          await tx1.store.put(stage);
        }

        // Insert default pillars
        const tx2 = this.db.transaction('pillars', 'readwrite');
        for (const pillar of this.defaultPillars) {
          await tx2.store.put(pillar);
        }

        // Insert default function capabilities
        const tx3 = this.db.transaction('functionCapabilities', 'readwrite');
        for (const fc of this.defaultFunctionCapabilities) {
          await tx3.store.put(fc);
        }

        console.log('Default ZTMM framework data initialized');
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
      throw error;
    }
  }

  // Pillar operations
  async getPillars(): Promise<Pillar[]> {
    await this.ensureInitialized();
    try {
      const pillars = await this.getDatabase().getAllFromIndex('pillars', 'by-order');
      return (pillars || []).map(p => ({ id: p.id, name: p.name }));
    } catch (error) {
      console.error('Error getting pillars:', error);
      return [];
    }
  }

  async addPillar(name: string): Promise<void> {
    await this.ensureInitialized();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Pillar name is required');
    }
    if (name.length > 255) {
      throw new Error('Pillar name cannot exceed 255 characters');
    }

    // Check for duplicates
    try {
      const existing = await this.getDatabase().getFromIndex('pillars', 'by-name', name.trim());
      if (existing) {
        throw new Error('Pillar with this name already exists');
      }
      // No duplicate found, proceed with creation
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('already exists')) {
        throw error;
      }
      // Other errors (like database access issues) - log and continue
      console.warn('Error checking for duplicate pillar:', error);
    }

    const newPillar: Omit<Pillar, 'id'> & { order_index: number } = {
      name: name.trim(),
      order_index: (await this.getDatabase().count('pillars')) + 1
    };

    await this.getDatabase().add('pillars', newPillar as Pillar & { order_index: number });
  }

  async removePillar(id: number): Promise<void> {
    await this.ensureInitialized();

    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid pillar ID');
    }

    const tx = this.getDatabase().transaction(['pillars', 'functionCapabilities', 'technologiesProcesses', 'assessmentResponses'], 'readwrite');

    try {
      // Get all function capabilities for this pillar
      const functionCapabilities = await tx.objectStore('functionCapabilities').index('by-pillar').getAll(id);

      // Remove assessment responses for technologies/processes under this pillar
      for (const fc of functionCapabilities) {
        const techProcesses = await tx.objectStore('technologiesProcesses').index('by-function-capability').getAll(fc.id);
        for (const tp of techProcesses) {
          const assessmentResponse = await tx.objectStore('assessmentResponses').index('by-tech-process').get(tp.id);
          if (assessmentResponse) {
            await tx.objectStore('assessmentResponses').delete(assessmentResponse.id);
          }
        }

        // Remove technologies/processes under this function capability
        for (const tp of techProcesses) {
          await tx.objectStore('technologiesProcesses').delete(tp.id);
        }
      }

      // Remove all function capabilities under this pillar
      for (const fc of functionCapabilities) {
        await tx.objectStore('functionCapabilities').delete(fc.id);
      }

      // Remove the pillar
      await tx.objectStore('pillars').delete(id);

      await tx.done;
    } catch (error) {
      console.error('Error removing pillar:', error);
      throw error;
    }
  }

  async editPillar(id: number, name: string): Promise<void> {
    await this.ensureInitialized();

    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid pillar ID');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Pillar name is required');
    }

    const pillar = await this.getDatabase().get('pillars', id);
    if (!pillar) {
      throw new Error('Pillar not found');
    }

    pillar.name = name.trim();
    await this.getDatabase().put('pillars', pillar);
  }

  async savePillarOrder(order: number[]): Promise<void> {
    await this.ensureInitialized();

    if (!Array.isArray(order) || order.length === 0) {
      throw new Error('Invalid order array');
    }

    const tx = this.getDatabase().transaction('pillars', 'readwrite');

    for (let i = 0; i < order.length; i++) {
      const pillar = await tx.store.get(order[i]);
      if (pillar) {
        pillar.order_index = i;
        await tx.store.put(pillar);
      }
    }

    await tx.done;
  }

  // Function Capability operations
  async getFunctionCapabilities(): Promise<FunctionCapability[]> {
    await this.ensureInitialized();
    try {
      const capabilities = await this.getDatabase().getAllFromIndex('functionCapabilities', 'by-order');
      return (capabilities || []).map(fc => ({
        id: fc.id,
        name: fc.name,
        type: fc.type,
        pillar_id: fc.pillar_id
      }));
    } catch (error) {
      console.error('Error getting function capabilities:', error);
      return [];
    }
  }

  async addFunctionCapability(name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    await this.ensureInitialized();

    if (!name || name.trim().length === 0) {
      throw new Error('Function/Capability name is required');
    }
    if (!['Function', 'Capability'].includes(type)) {
      throw new Error('Type must be either Function or Capability');
    }
    if (!Number.isInteger(pillarId) || pillarId < 1) {
      throw new Error('Invalid pillar ID');
    }

    const newFunctionCapability: Omit<FunctionCapability, 'id'> & { order_index: number } = {
      name: name.trim(),
      type,
      pillar_id: pillarId,
      order_index: (await this.getDatabase().count('functionCapabilities')) + 1
    };

    await this.getDatabase().add('functionCapabilities', newFunctionCapability as FunctionCapability & { order_index: number });
  }

  async removeFunctionCapability(id: number): Promise<void> {
    await this.ensureInitialized();

    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid function capability ID');
    }

    const tx = this.getDatabase().transaction(['functionCapabilities', 'technologiesProcesses', 'assessmentResponses'], 'readwrite');

    try {
      // Get all technologies/processes for this function capability
      const techProcesses = await tx.objectStore('technologiesProcesses').index('by-function-capability').getAll(id);

      // Remove assessment responses for these technologies/processes
      for (const tp of techProcesses) {
        const assessmentResponse = await tx.objectStore('assessmentResponses').index('by-tech-process').get(tp.id);
        if (assessmentResponse) {
          await tx.objectStore('assessmentResponses').delete(assessmentResponse.id);
        }
      }

      // Remove technologies/processes under this function capability
      for (const tp of techProcesses) {
        await tx.objectStore('technologiesProcesses').delete(tp.id);
      }

      // Remove the function capability
      await tx.objectStore('functionCapabilities').delete(id);

      await tx.done;
    } catch (error) {
      console.error('Error removing function capability:', error);
      throw error;
    }
  }

  async editFunctionCapability(id: number, name: string, type: 'Function' | 'Capability', pillarId: number): Promise<void> {
    await this.ensureInitialized();

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

    const functionCapability = await this.getDatabase().get('functionCapabilities', id);
    if (!functionCapability) {
      throw new Error('Function capability not found');
    }

    functionCapability.name = name.trim();
    functionCapability.type = type;
    functionCapability.pillar_id = pillarId;

    await this.getDatabase().put('functionCapabilities', functionCapability);
  }

  async saveFunctionOrder(order: number[]): Promise<void> {
    await this.ensureInitialized();

    if (!Array.isArray(order) || order.length === 0) {
      throw new Error('Invalid order array');
    }

    const tx = this.getDatabase().transaction('functionCapabilities', 'readwrite');

    for (let i = 0; i < order.length; i++) {
      const fc = await tx.store.get(order[i]);
      if (fc) {
        fc.order_index = i;
        await tx.store.put(fc);
      }
    }

    await tx.done;
  }

  // Maturity Stage operations
  async getMaturityStages(): Promise<MaturityStage[]> {
    await this.ensureInitialized();
    try {
      const result = await this.getDatabase().getAll('maturityStages');
      return result || [];
    } catch (error) {
      console.error('Error getting maturity stages:', error);
      return [];
    }
  }

  // Technology Process operations
  async getTechnologiesProcesses(functionCapabilityId?: number): Promise<TechnologyProcess[]> {
    await this.ensureInitialized();

    if (functionCapabilityId !== undefined) {
      return await this.getDatabase().getAllFromIndex('technologiesProcesses', 'by-function-capability', functionCapabilityId);
    } else {
      return await this.getDatabase().getAll('technologiesProcesses');
    }
  }

  async getAllTechnologiesProcesses(): Promise<TechnologyProcess[]> {
    await this.ensureInitialized();
    try {
      const result = await this.getDatabase().getAll('technologiesProcesses');
      return result || [];
    } catch (error) {
      console.error('Error getting all technologies/processes:', error);
      return [];
    }
  }

  async getTechnologiesProcessesByFunction(functionCapabilityId: number): Promise<TechnologyProcess[]> {
    await this.ensureInitialized();

    if (!Number.isInteger(functionCapabilityId) || functionCapabilityId < 1) {
      throw new Error('Invalid function capability ID');
    }

    try {
      const result = await this.getDatabase().getAllFromIndex('technologiesProcesses', 'by-function-capability', functionCapabilityId);
      return result || [];
    } catch (error) {
      console.error('Error getting technologies/processes by function:', error);
      return [];
    }
  }

  async addTechnologyProcess(name: string, description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    await this.ensureInitialized();

    if (!name || name.trim().length === 0) {
      throw new Error('Technology/Process name is required');
    }
    if (name.length > 100) {
      throw new Error('Name cannot exceed 100 characters');
    }
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

    const newTechnologyProcess: Omit<TechnologyProcess, 'id'> = {
      name: name.trim(),
      description: description.trim(),
      type,
      function_capability_id: functionCapabilityId,
      maturity_stage_id: maturityStageId
    };

    await this.getDatabase().add('technologiesProcesses', newTechnologyProcess as TechnologyProcess);
  }

  async removeTechnologyProcess(id: number): Promise<void> {
    await this.ensureInitialized();

    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid technology process ID');
    }

    const tx = this.getDatabase().transaction(['technologiesProcesses', 'assessmentResponses'], 'readwrite');

    try {
      // Remove assessment response for this technology process
      const assessmentResponse = await tx.objectStore('assessmentResponses').index('by-tech-process').get(id);
      if (assessmentResponse) {
        await tx.objectStore('assessmentResponses').delete(assessmentResponse.id);
      }

      // Remove the technology process
      await tx.objectStore('technologiesProcesses').delete(id);

      await tx.done;
    } catch (error) {
      console.error('Error removing technology process:', error);
      throw error;
    }
  }

  async editTechnologyProcess(id: number, name: string, description: string, type: 'Technology' | 'Process', functionCapabilityId: number, maturityStageId: number): Promise<void> {
    await this.ensureInitialized();

    if (!Number.isInteger(id) || id < 1) {
      throw new Error('Invalid technology process ID');
    }
    if (!name || name.trim().length === 0) {
      throw new Error('Technology/Process name is required');
    }
    if (name.length > 100) {
      throw new Error('Name cannot exceed 100 characters');
    }
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

    const techProcess = await this.getDatabase().get('technologiesProcesses', id);
    if (!techProcess) {
      throw new Error('Technology process not found');
    }

    techProcess.name = name.trim();
    techProcess.description = description.trim();
    techProcess.type = type;
    techProcess.function_capability_id = functionCapabilityId;
    techProcess.maturity_stage_id = maturityStageId;

    await this.getDatabase().put('technologiesProcesses', techProcess);
  }

  // Assessment operations
  async saveAssessment(techProcessId: number, status: AssessmentStatus, notes?: string): Promise<void> {
    await this.ensureInitialized();

    if (!Number.isInteger(techProcessId) || techProcessId < 1) {
      throw new Error('Invalid technology process ID');
    }
    const validStatuses: AssessmentStatus[] = ['Not Implemented', 'Partially Implemented', 'Fully Implemented', 'Superseded'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid assessment status');
    }
    if (notes && notes.length > 2000) {
      throw new Error('Notes cannot exceed 2000 characters');
    }

    const tx = this.getDatabase().transaction('assessmentResponses', 'readwrite');

    try {
      // Check if assessment already exists
      const existingAssessment = await tx.store.index('by-tech-process').get(techProcessId);

      if (existingAssessment) {
        // Update existing assessment
        existingAssessment.status = status;
        existingAssessment.notes = notes || undefined;
        await tx.store.put(existingAssessment);
      } else {
        // Create new assessment
        const newAssessment = {
          tech_process_id: techProcessId,
          status,
          notes: notes || undefined
        };
        await tx.store.add(newAssessment as AssessmentResponse);
      }

      await tx.done;
    } catch (error) {
      console.error('Error saving assessment:', error);
      throw error;
    }
  }

  async getAssessmentResponses(): Promise<AssessmentResponse[]> {
    await this.ensureInitialized();
    try {
      const result = await this.getDatabase().getAll('assessmentResponses');
      return result || [];
    } catch (error) {
      console.error('Error getting assessment responses:', error);
      return [];
    }
  }

  // Utility operations
  async exportDatabase(): Promise<Uint8Array> {
    await this.ensureInitialized();

    try {
      // Export all data as JSON
      const data = {
        pillars: await this.getDatabase().getAll('pillars'),
        functionCapabilities: await this.getDatabase().getAll('functionCapabilities'),
        maturityStages: await this.getDatabase().getAll('maturityStages'),
        technologiesProcesses: await this.getDatabase().getAll('technologiesProcesses'),
        assessmentResponses: await this.getDatabase().getAll('assessmentResponses')
      };

      // Convert to string and then to Uint8Array
      const jsonString = JSON.stringify(data);
      const encoder = new TextEncoder();
      return encoder.encode(jsonString);
    } catch (error) {
      console.error('Database export failed:', error);
      throw new Error('Failed to export database');
    }
  }

  async importDatabase(data: Uint8Array): Promise<void> {
    await this.ensureInitialized();

    try {
      // Create backup before importing
      await this.createBackup();

      // Convert Uint8Array to string and parse JSON
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(data);
      const importData = JSON.parse(jsonString);

      // Clear existing data and import new data
      await this.clearAllData();
      await this.importDataWithPreservedIds(importData);

      console.log('Database imported successfully');
    } catch (error) {
      console.error('Database import failed:', error);
      throw new Error('Failed to import database');
    }
  }

  async createBackup(): Promise<void> {
    await this.ensureInitialized();

    try {
      const data = await this.exportDatabase();
      const timestamp = Date.now();

      const backup = {
        name: `backup_${timestamp}`,
        data,
        timestamp
      };

      await this.getDatabase().put('backups', backup);
      console.log('Database backup created');
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Backup creation failed');
    }
  }

  async getBackups(): Promise<{ name: string; timestamp: number }[]> {
    await this.ensureInitialized();

    const backups = await this.getDatabase().getAll('backups');
    return backups.map(backup => ({
      name: backup.name,
      timestamp: backup.timestamp
    })).sort((a, b) => b.timestamp - a.timestamp);
  }

  async restoreBackup(backupName: string): Promise<void> {
    await this.ensureInitialized();

    const backup = await this.getDatabase().get('backups', backupName);
    if (!backup) {
      throw new Error('Backup not found');
    }

    if (!(backup.data instanceof Uint8Array)) {
      throw new Error('Invalid backup data format');
    }

    await this.importDatabase(backup.data);
  }

  async clearAllData(): Promise<void> {
    await this.ensureInitialized();

    try {
      const tx = this.getDatabase().transaction(['assessmentResponses', 'technologiesProcesses', 'functionCapabilities', 'pillars'], 'readwrite');

      // Clear all data in proper order due to foreign key relationships
      await tx.objectStore('assessmentResponses').clear();
      await tx.objectStore('technologiesProcesses').clear();

      // Clear only non-default function capabilities
      const allFunctionCapabilities = await tx.objectStore('functionCapabilities').getAll();
      for (const fc of allFunctionCapabilities) {
        if (fc.id > 37) { // Only remove user-added function capabilities
          await tx.objectStore('functionCapabilities').delete(fc.id);
        }
      }

      // Clear only non-default pillars
      const allPillars = await tx.objectStore('pillars').getAll();
      for (const pillar of allPillars) {
        if (!this.defaultPillars.some(dp => dp.name === pillar.name)) {
          await tx.objectStore('pillars').delete(pillar.id);
        }
      }

      await tx.done;
      console.log('All user data cleared successfully (default pillars and capabilities preserved)');
    } catch (error) {
      console.error('Error clearing database:', error);
      throw error;
    }
  }

  async resetDatabase(): Promise<void> {
    await this.ensureInitialized();

    try {
      console.log('Starting complete database reset...');

      // Clear all object stores
      const tx = this.getDatabase().transaction(['assessmentResponses', 'technologiesProcesses', 'functionCapabilities', 'pillars', 'maturityStages'], 'readwrite');

      await tx.objectStore('assessmentResponses').clear();
      await tx.objectStore('technologiesProcesses').clear();
      await tx.objectStore('functionCapabilities').clear();
      await tx.objectStore('pillars').clear();
      await tx.objectStore('maturityStages').clear();

      await tx.done;

      // Reinitialize with default data
      await this.initializeDefaultData();

      console.log('Database completely reset and reinitialized successfully');
    } catch (error) {
      console.error('Error resetting database:', error);
      throw new Error(`Failed to reset database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async importDataWithPreservedIds(data: any): Promise<void> {
    await this.ensureInitialized();

    try {
      console.log('Starting import with preserved IDs...');

      // Import in dependency order with preserved IDs
      const tx = this.getDatabase().transaction(['maturityStages', 'pillars', 'functionCapabilities', 'technologiesProcesses', 'assessmentResponses'], 'readwrite');

      // 1. Maturity Stages (independent)
      if (data.maturityStages && Array.isArray(data.maturityStages)) {
        for (const ms of data.maturityStages) {
          await tx.objectStore('maturityStages').put(ms);
        }
      }

      // 2. Pillars (independent)
      if (data.pillars && Array.isArray(data.pillars)) {
        for (const pillar of data.pillars) {
          await tx.objectStore('pillars').put(pillar);
        }
      }

      // 3. Function Capabilities (depend on pillars)
      if (data.functionCapabilities && Array.isArray(data.functionCapabilities)) {
        for (const fc of data.functionCapabilities) {
          await tx.objectStore('functionCapabilities').put(fc);
        }
      }

      // 4. Technologies/Processes (depend on function capabilities and maturity stages)
      if (data.technologiesProcesses && Array.isArray(data.technologiesProcesses)) {
        for (const tp of data.technologiesProcesses) {
          await tx.objectStore('technologiesProcesses').put(tp);
        }
      }

      // 5. Assessment Responses (depend on everything else)
      if (data.assessmentResponses && Array.isArray(data.assessmentResponses)) {
        for (const ar of data.assessmentResponses) {
          await tx.objectStore('assessmentResponses').put(ar);
        }
      }

      await tx.done;
      console.log('Import with preserved IDs completed successfully');
    } catch (error) {
      console.error('Error importing data with preserved IDs:', error);
      throw new Error(`Failed to import data with preserved IDs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper method to ensure database is initialized
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }

  // Helper method to safely get the database instance
  private getDatabase(): IDBPDatabase<ZtmmDB> {
    if (!this.db) {
      throw new Error('Database is not initialized. Call ensureInitialized() first.');
    }
    return this.db;
  }

  // Check if service is initialized
  isReady(): boolean {
    return this.isInitialized;
  }
}
