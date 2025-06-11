/**
 * Test setup configuration for handling IndexedDB test environment
 */
import { TestBed } from '@angular/core/testing';
import { IndexedDBService } from '../services/indexeddb.service';
import { TestUtilsIndexedDB } from './test-utils-indexeddb';

/**
 * Configures the test environment with proper mocks to avoid database initialization issues
 */
export function configureTestEnvironment() {
  // Create a global mock for IndexedDB service to avoid database initialization issues
  const mockIndexedDBService = TestUtilsIndexedDB.createMockIndexedDBService();

  // Configure TestBed with the mock service
  TestBed.configureTestingModule({
    providers: [
      { provide: IndexedDBService, useValue: mockIndexedDBService }
    ]
  });

  return mockIndexedDBService;
}

/**
 * Helper function to get the configured mock service in tests
 */
export function getMockIndexedDBService(): any {
  return TestBed.inject(IndexedDBService);
}

/**
 * Resets the mock service to its initial state
 */
export function resetMockIndexedDBService() {
  const mockService = getMockIndexedDBService();
  if (mockService && mockService.resetMockData) {
    mockService.resetMockData();
  }
}
