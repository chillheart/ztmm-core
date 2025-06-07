// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = tseslint.config(
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.app.json", "./tsconfig.spec.json"],
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      // Additional TypeScript rules for better code quality
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "@typescript-eslint/explicit-function-return-type": "off", // Too strict for Angular
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
      // Security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      // Additional template rules for security and accessibility
      "@angular-eslint/template/no-any": "warn",
      "@angular-eslint/template/no-autofocus": "error",
      "@angular-eslint/template/click-events-have-key-events": "error",
      "@angular-eslint/template/mouse-events-have-key-events": "error",
    },
  },
  {
    // Configuration for JavaScript files (ES modules)
    files: ["*.js", "**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        global: "readonly",
        process: "readonly",
        Buffer: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
    rules: {
      // Core ESLint rules for JavaScript
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-console": "warn",
      "no-debugger": "error",
      "no-alert": "error",
      // Security rules
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
      "no-script-url": "error",
      // Code quality rules
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "all"],
      // Electron security rules
      "no-restricted-imports": ["error", {
        "patterns": ["child_process", "fs", "path", "os"]
      }],
    },
  },
  {
    // Specific configuration for Electron main process and preload scripts
    files: ["main.js", "preload.js"],
    rules: {
      // Allow Node.js modules in main process and preload scripts
      "no-restricted-imports": "off",
      // Electron-specific rules
      "no-console": "off", // Allow console in main process for debugging
    },
  },
  {
    // Configuration for test files
    files: ["**/*.spec.ts", "**/*.test.ts", "**/testing/**/*.ts", "security-test.js", "integration-test.js"],
    rules: {
      // Relax some rules for test files
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "no-console": "off",
      "no-restricted-imports": "off",
    },
  },
  {
    // Ignore patterns
    ignores: [
      "dist/**",
      "dist-electron/**",
      "node_modules/**",
      "coverage/**",
      "*.min.js",
      "build/**",
      ".angular/**",
      "security-test-results.log",
      "integration-test-results.log",
    ],
  }
);
