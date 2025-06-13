// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';

// Manual setup of fake-indexeddb to avoid read-only property errors
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FDBFactory: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let FDBKeyRange: any;

try {
  // Import fake-indexeddb components manually
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FDBFactory = require('fake-indexeddb/lib/FDBFactory').default;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  FDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange').default;
} catch (error) {
  console.warn('Could not import fake-indexeddb components, using native IndexedDB:', error);
}

// Setup global IndexedDB mock for all tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: any;

// Store original indexedDB for cleanup (if restoration is needed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let originalIndexedDB: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let originalIDBKeyRange: any;

// Function to reset IndexedDB between tests
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).resetIndexedDB = () => {
  if (FDBFactory && FDBKeyRange) {
    try {
      // Create a fresh FDBFactory instance
      const freshDB = new FDBFactory();

      if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'indexedDB', {
          value: freshDB,
          writable: true,
          configurable: true
        });
      }

      if (typeof global !== 'undefined') {
        global.indexedDB = freshDB;
      }
    } catch (error) {
      console.warn('Could not reset IndexedDB:', error);
    }
  }
};

// Function to restore original IndexedDB (useful for test cleanup)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).restoreOriginalIndexedDB = () => {
  try {
    if (typeof window !== 'undefined') {
      if (originalIndexedDB) {
        Object.defineProperty(window, 'indexedDB', {
          value: originalIndexedDB,
          writable: true,
          configurable: true
        });
      }
      if (originalIDBKeyRange) {
        Object.defineProperty(window, 'IDBKeyRange', {
          value: originalIDBKeyRange,
          writable: true,
          configurable: true
        });
      }
    }
  } catch (error) {
    console.warn('Could not restore original IndexedDB:', error);
  }
};

// Safely set up IndexedDB mock without overwriting read-only properties
if (FDBFactory && FDBKeyRange) {
  try {
    if (typeof window !== 'undefined') {
      // Store original values for potential restoration
      if (window.indexedDB) {
        originalIndexedDB = window.indexedDB;
      }
      if (window.IDBKeyRange) {
        originalIDBKeyRange = window.IDBKeyRange;
      }

      // Use defineProperty to avoid the read-only error
      if (!window.indexedDB || typeof window.indexedDB.open !== 'function') {
        Object.defineProperty(window, 'indexedDB', {
          value: new FDBFactory(),
          writable: true,
          configurable: true
        });
      }
      if (!window.IDBKeyRange) {
        Object.defineProperty(window, 'IDBKeyRange', {
          value: FDBKeyRange,
          writable: true,
          configurable: true
        });
      }
    }

    // Also set up for global scope
    if (typeof global !== 'undefined') {
      if (!global.indexedDB) {
        global.indexedDB = new FDBFactory();
      }
      if (!global.IDBKeyRange) {
        global.IDBKeyRange = FDBKeyRange;
      }
    }
  } catch (error) {
    // If we can't set it up, that's fine - the browser's native IndexedDB will be used
    console.warn('Could not set up fake-indexeddb, using native implementation:', error);
  }
}

import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Mock window.confirm for headless browser tests
// This prevents actual confirm dialogs from appearing during testing
if (typeof window !== 'undefined') {
  const originalConfirm = window.confirm;
  const originalAlert = window.alert;
  const originalPrompt = window.prompt;

  // Force override confirm to prevent any dialogs
  window.confirm = function(message?: string): boolean {
    console.log('MOCKED CONFIRM:', message);
    // Return true by default for tests, individual tests can override with spyOn
    return true;
  };

  // Also mock alert and prompt to prevent any other dialogs
  window.alert = function(message?: string): void {
    console.log('MOCKED ALERT:', message);
  };

  window.prompt = function(message?: string, defaultText?: string): string | null {
    console.log('MOCKED PROMPT:', message, defaultText);
    return defaultText || '';
  };

  // Store originals for tests that need to restore them
  (window as any).originalConfirm = originalConfirm;
  (window as any).originalAlert = originalAlert;
  (window as any).originalPrompt = originalPrompt;
}

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
