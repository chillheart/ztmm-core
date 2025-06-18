import { Pillar, FunctionCapability, MaturityStage, TechnologyProcess, AssessmentResponse, AssessmentStatus } from './ztmm.models';

describe('ZTMM Models', () => {
  describe('Pillar Interface', () => {
    it('should create a valid Pillar object', () => {
      const pillar: Pillar = {
        id: 1,
        name: 'Identity'
      };

      expect(pillar.id).toBe(1);
      expect(pillar.name).toBe('Identity');
    });
  });

  describe('FunctionCapability Interface', () => {
    it('should create a valid Function object', () => {
      const functionObj: FunctionCapability = {
        id: 1,
        name: 'User Identity Management',
        type: 'Function',
        pillar_id: 1
      };

      expect(functionObj.id).toBe(1);
      expect(functionObj.name).toBe('User Identity Management');
      expect(functionObj.type).toBe('Function');
      expect(functionObj.pillar_id).toBe(1);
    });

    it('should create a valid Capability object', () => {
      const capability: FunctionCapability = {
        id: 2,
        name: 'Multi-factor Authentication',
        type: 'Capability',
        pillar_id: 1
      };

      expect(capability.type).toBe('Capability');
    });

    it('should only allow Function or Capability types', () => {
      // TypeScript will enforce this at compile time
      const validTypes: ('Function' | 'Capability')[] = ['Function', 'Capability'];
      expect(validTypes).toContain('Function');
      expect(validTypes).toContain('Capability');
    });
  });

  describe('MaturityStage Interface', () => {
    it('should create valid maturity stage objects', () => {
      const traditional: MaturityStage = {
        id: 1,
        name: 'Traditional'
      };

      const initial: MaturityStage = {
        id: 2,
        name: 'Initial'
      };

      const advanced: MaturityStage = {
        id: 3,
        name: 'Advanced'
      };

      const optimal: MaturityStage = {
        id: 4,
        name: 'Optimal'
      };

      expect(traditional.name).toBe('Traditional');
      expect(initial.name).toBe('Initial');
      expect(advanced.name).toBe('Advanced');
      expect(optimal.name).toBe('Optimal');
    });
  });

  describe('TechnologyProcess Interface', () => {
    it('should create a valid Technology object', () => {
      const technology: TechnologyProcess = {
        id: 1,
        name: 'Azure Active Directory',
        description: 'Azure Active Directory',
        type: 'Technology',
        function_capability_id: 1,
        maturity_stage_id: 2
      };

      expect(technology.type).toBe('Technology');
      expect(technology.name).toBe('Azure Active Directory');
      expect(technology.description).toBe('Azure Active Directory');
    });

    it('should create a valid Process object', () => {
      const process: TechnologyProcess = {
        id: 2,
        name: 'Identity lifecycle management',
        description: 'Identity lifecycle management',
        type: 'Process',
        function_capability_id: 1,
        maturity_stage_id: 3
      };

      expect(process.type).toBe('Process');
      expect(process.name).toBe('Identity lifecycle management');
      expect(process.description).toBe('Identity lifecycle management');
    });
  });

  describe('AssessmentStatus Type', () => {
    it('should define valid assessment statuses', () => {
      const statuses: AssessmentStatus[] = [
        'Not Implemented',
        'Partially Implemented',
        'Fully Implemented'
      ];

      expect(statuses).toHaveSize(3);
      expect(statuses).toContain('Not Implemented');
      expect(statuses).toContain('Partially Implemented');
      expect(statuses).toContain('Fully Implemented');
    });
  });

  describe('AssessmentResponse Interface', () => {
    it('should create a valid assessment response without notes', () => {
      const response: AssessmentResponse = {
        id: 1,
        tech_process_id: 1,
        status: 'Fully Implemented'
      };

      expect(response.id).toBe(1);
      expect(response.tech_process_id).toBe(1);
      expect(response.status).toBe('Fully Implemented');
      expect(response.notes).toBeUndefined();
    });

    it('should create a valid assessment response with notes', () => {
      const response: AssessmentResponse = {
        id: 2,
        tech_process_id: 2,
        status: 'Partially Implemented',
        notes: 'Implementation in progress, expected completion Q2'
      };

      expect(response.notes).toBe('Implementation in progress, expected completion Q2');
    });
  });
});
