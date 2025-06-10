/**
 * Test setup configuration for handling SQL.js WebAssembly initialization issues
 */
import { TestBed } from '@angular/core/testing';
import { SqlJsService } from '../services/sqljs.service';
import { TestUtils } from './test-utils';

/**
 * Configures the test environment with proper mocks to avoid WebAssembly issues
 */
export function configureTestEnvironment() {
  // Create a global mock for SQL.js service to avoid WASM initialization issues
  const mockSqlJsService = TestUtils.createMockSqlJsService();

  // Configure TestBed with the mock service
  TestBed.configureTestingModule({
    providers: [
      { provide: SqlJsService, useValue: mockSqlJsService }
    ]
  });

  return mockSqlJsService;
}

/**
 * Helper function to get the configured mock service in tests
 */
export function getMockSqlJsService(): any {
  return TestBed.inject(SqlJsService);
}

/**
 * Resets the mock service to its initial state
 */
export function resetMockSqlJsService() {
  const mockService = getMockSqlJsService();
  if (mockService && mockService.resetMockData) {
    mockService.resetMockData();
  }
}
