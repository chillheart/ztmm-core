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

// Store original indexedDB for cleanup
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

// Safely set up IndexedDB mock without overwriting read-only properties
if (FDBFactory && FDBKeyRange) {
  try {
    if (typeof window !== 'undefined') {
      // Store original values (keeping for potential future use)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      originalIndexedDB = window.indexedDB;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      originalIDBKeyRange = window.IDBKeyRange;

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

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);
