# ZTMM Assessment Tool

[![PR Checks](https://github.com/chillheart/ztmm-assessment/workflows/PR%20Checks/badge.svg)](https://github.com/chillheart/ztmm-assessment/actions/workflows/pr-validation.yml)

A compreensive Zero Trust Maturity Model (ZTMM) assessment application built with Angular. This web-based application helps organizations evaluate their Zero Trust implementation maturity across different pillars, functions, capabilities, and technologies with complete privacy - all data is stored locally in your browser.

## 🚀 Features

### Core Functionality
- **📊 Assessment Management**: Conduct maturity assessments against the Zero Trust framework
- **🏗️ Configuration Management**: Define and manage Zero Trust pillars, functions/capabilities, and technologies/processes
- **📈 Progress Tracking**: Visual progress indicators and completion tracking
- **📋 Reports Dashboard**: View and analyze assessment results with detailed reporting and PDF export
- **📁 Data Management**: Import/export functionality for backup and data migration

### Privacy & Security
- **🔒 Local Data Storage**: All data stored locally in your browser using IndexedDB
- **🚫 No External Servers**: Complete privacy - no data is sent to external servers
- **🔐 Client-Side Only**: Everything runs in your browser for maximum security

### User Interface
- **🎨 Modern Bootstrap UI**: Clean, responsive design with Bootstrap 5
- **🔧 Configuration Section**: Intuitive admin interface with tabbed navigation
- **📱 Responsive Design**: Works seamlessly across different screen sizes
- **🖱️ Interactive Features**: Drag-and-drop reordering, inline editing, and form validation
- **📖 Getting Started Guide**: Step-by-step instructions for new users

### Technical Features
- **💾 IndexedDB Storage**: Local browser database with relational data structure
- **🔄 Real-time Updates**: Live data synchronization between UI and storage
- **✅ Data Validation**: Comprehensive form validation and error handling
- **🗑️ Cascading Deletes**: Safe data management with relationship integrity
- **📄 PDF Export**: Generate professional assessment reports

## 🛠️ Technology Stack

- **Frontend**: Angular 19.2 with TypeScript
- **UI Framework**: Bootstrap 5.3 with Bootstrap Icons
- **Database**: IndexedDB (browser-native database)
- **Styling**: SCSS with responsive design
- **Export**: PDF-lib for clean, professional report generation
- **Storage**: Local browser storage (no external dependencies)

## 📖 Usage Guide

### Getting Started
1. **Visit the Application**: Open the web application in your browser
2. **Read the Privacy Notice**: All your data stays local - nothing is sent to external servers
3. **Follow the Getting Started Guide**: The home page provides step-by-step instructions

### 1. Configuration Setup
Navigate to the Configuration section to set up your ZTMM framework:

- **Pillars**: Define Zero Trust pillars (e.g., Identity, Device, Network, Data, Applications, Infrastructure)
- **Functions/Capabilities**: Add specific functions and capabilities for each pillar
- **Maturity Stages**: Define maturity levels (typically Initial, Advanced, Optimal)
- **Technologies/Processes**: Define specific technologies and processes for assessment

### 2. Conducting Assessments
1. Go to the Assessment section
2. Select a pillar to assess
3. Review the progress summary table
4. Click "Assess" for each function/capability
5. Rate each technology/process implementation status
6. Add optional notes for context and future reference

### 3. Viewing Reports
Access the Reports section to:
- View completed assessments with visual indicators
- Analyze maturity scores across pillars
- Export assessment reports to PDF
- Track progress over time

**Note**: The `/results` route automatically redirects to `/reports` for consistency and improved navigation.

## 🔧 Development

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/chillheart/ztmm-assessment.git
   cd ztmm-assessment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:4200`

### Code Scaffolding
Generate new components:
```bash
ng generate component component-name
```
## 🚀 Running the Application

### Development Mode
For active development with automatic rebuilding and hot reload:
```bash
npm start
```
This will start the Angular development server on `http://localhost:4200`

### Production Build
To build the application for production:
```bash
npm run build:prod
```

### Preview Production Build
To preview the production build locally:
```bash
npm run preview
```

## 🌐 Deployment

### GitHub Pages (Automated)
The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages when a new release is created:

1. **Create a Release**: Go to your repository's "Releases" section and create a new release
2. **Automatic Deployment**: The workflow will automatically:
   - Run tests and linting
   - Build the application with the correct base href
   - Deploy to GitHub Pages

#### Manual GitHub Pages Deployment
For manual deployment to GitHub Pages:
```bash
npm run build:github-pages
```
Or using the legacy script:
```bash
npm run deploy:gh-pages
```

#### GitHub Pages Setup
To enable GitHub Pages deployment:
1. Go to your repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will handle the rest automatically

### Self-Hosting
1. Build the production version: `npm run build:prod`
2. Copy the contents of the `dist/` folder to your web server
3. Configure your web server to serve the `index.html` file for all routes

## 🏗️ Project Structure

The application follows Angular best practices with a feature-based architecture for maintainability and scalability:

```
src/
├── app/
│   ├── core/                # Core application-wide components (home, navbar, footer)
│   ├── features/            # Feature modules, each in its own folder
│   │   ├── assessment/          # Assessment workflow and progress tracking
│   │   ├── configuration/       # Admin/configuration management (pillars, functions, tech, data management)
│   │   └── reports/             # Reporting dashboard, detail views, export logic
│   ├── models/              # TypeScript interfaces and data models
│   ├── services/            # Application-wide services (data access, PDF export, demo data)
│   ├── shared/              # Shared/reusable UI components (if any)
│   ├── testing/             # Test setup and utilities
│   ├── utilities/           # Helper functions and utility services
│   ├── app.component.*      # Root Angular component
│   ├── app.config.ts        # Application configuration
│   └── app.routes.ts        # Application routing
├── assets/                  # Static assets (icons, images)
├── styles.scss              # Global styles
├── main.ts                  # Application bootstrap
└── index.html               # Main HTML template
```

### Architecture Highlights

- **Feature-Based Organization**: Each major functionality (assessment, configuration, reports) is organized in its own feature module
- **Core vs Features**: Core components are application-wide, while features are domain-specific
- **Separation of Concerns**: Clear separation between data models, services, UI components, and utilities
- **Security-First**: Dedicated security testing module with comprehensive test suites
- **Testing Infrastructure**: Robust testing setup with utilities for different testing scenarios
- **Scalable Structure**: Easy to extend with new features while maintaining clean architecture

## 🗄️ Data Storage

The application uses **IndexedDB** (browser-native database) with the following object stores:
- `pillars` - Zero Trust pillars with ordering
- `functionCapabilities` - Functions and capabilities linked to pillars
- `maturityStages` - Maturity level definitions (Initial, Advanced, Optimal)
- `technologiesProcesses` - Technologies and processes for assessment
- `assessmentResponses` - Assessment results and user responses

### Data Privacy
- **Local Storage Only**: All data is stored in your browser's IndexedDB
- **No External Servers**: No data is transmitted to external servers
- **Complete Privacy**: Your assessment data never leaves your device
- **Backup/Restore**: Export your data as JSON for backup or migration

### Building for Production

Build the application for production deployment:
```bash
npm run build:prod
```

The built application will be available in the `dist/` directory and can be deployed to any static web hosting service.

## 🔗 Demo & Live Version

You can try the application online at: [GitHub Pages Demo](https://chillheart.github.io/ztmm-assessment/)

## 🏠 Self-Hosting

Want to host this tool for your organization? 
1. Fork this repository
2. Customize the configuration as needed
3. Deploy to your preferred hosting platform:
   - **GitHub Pages**: Use `npm run deploy:gh-pages`
   - **Netlify**: Connect your repository for automatic deployments
   - **Vercel**: Import your repository for instant deployment
   - **Static Web Hosting**: Upload the `dist/` folder contents

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run security tests:
```bash
npm run security:test
```


## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure code quality
5. Submit a pull request

## 📄 License

This project is licensed under the GNU Affero General Public License v3.0 - see the LICENSE file for details.

## 🤝 Support

For questions, issues, or feature requests, please create an issue in the repository.

## 🔄 Version History

### **v1.3.5** (Current) - Navigation Simplification
- **🔄 Component Restructure**: Removed redundant Results component
  - Streamlined navigation by removing duplicate Results component
  - All `/results` routes now automatically redirect to `/reports` for consistency
  - Updated navigation links and test expectations throughout the application
  - Maintained backward compatibility with automatic redirection
- **📋 Documentation**: Updated README and navigation references
  - Corrected all documentation to reflect the simplified navigation structure
  - Enhanced routing documentation with redirect behavior explanation

### **v1.3.4** - Code Quality Enhancement
- **🔧 Code Quality**: Comprehensive linting and code quality improvements
  - Fixed all ESLint linting errors across the codebase
  - Applied automated fixes for formatting and style consistency
  - Enhanced code maintainability with proper parameter handling
- **✅ Testing Validation**: Verified code quality improvements
  - All 414 tests continue to pass after linting fixes
  - Maintained functionality while improving code standards
  - Ensured no regressions in existing features
- **📋 Development Process**: Enhanced development workflow
  - Improved branch-based development with code quality checks
  - Better adherence to TypeScript and Angular best practices
  - Streamlined linting process for future development

### **v1.3.3** - Feature-Based Architecture & Enhanced Security
- **🏗️ Architecture Refactor**: Migrated to feature-based Angular architecture
  - Organized code into `core/`, `features/`, and `shared/` modules
  - Improved maintainability and scalability
  - Better separation of concerns with domain-driven design
- **🔒 Security Enhancement**: Comprehensive security testing framework
  - OWASP Top 10 security tests integration
  - Penetration testing suite with automated validation
  - Security configuration and utilities for continuous monitoring
- **🧪 Testing Infrastructure**: Robust testing ecosystem
  - Enhanced test utilities for IndexedDB operations
  - Comprehensive unit and integration test coverage
  - Security-focused testing with automated CI/CD validation
- **📱 UI/UX Improvements**: Enhanced user experience
  - Assessment pagination for better navigation
  - Improved progress tracking and overview components
  - Enhanced footer and navigation components
- **⚡ Performance**: Optimized data handling and component structure

### **v1.3.0** - Major Feature Enhancements
- **🔄 CI/CD Pipeline**: Comprehensive continuous integration setup
  - GitHub Actions workflows for automated testing and deployment
  - CodeQL security scanning and vulnerability detection
  - Automated PR validation with enhanced checks
- **🛡️ Security Hardening**: Advanced security measures
  - Trivy filesystem scanning for vulnerabilities
  - Enhanced dependency auditing and security validation
  - Security configuration and monitoring tools

### **v1.2.0** - Native IndexedDB Implementation
- **💾 Database Migration**: Switched to using native IndexedDB APIs
  - Direct browser database integration for better performance
  - Improved data reliability and error handling
- **📖 User Experience**: Updated home page with comprehensive instructions
  - Privacy statement prominently displayed
  - Step-by-step getting started guide
  - Enhanced onboarding experience

### **v1.1.0** - Web Application Foundation
- **🌐 Web-Based Platform**: Complete transition to browser-based application
  - IndexedDB storage for local data persistence
  - Complete privacy with no external server dependencies
- **📊 Enhanced Features**: Comprehensive assessment capabilities
  - PDF export functionality for professional reporting
  - Import/export for data management and backup
  - Enhanced UI with Bootstrap 5 integration
- **🧪 Quality Assurance**: Comprehensive test coverage
  - Unit tests for all major components
  - Integration tests for data flow validation
  - Automated testing pipeline setup

### **v1.0.0** - Initial Release
- **⭐ Core Functionality**: Initial ZTMM assessment implementation
  - Configuration management with intuitive interface
  - Drag-and-drop reordering for user-friendly setup
  - Pillar-based assessment workflow
  - Progress tracking and basic reporting
- **🛠️ Foundation**: Basic Angular application structure
  - Component-based architecture
  - Bootstrap UI framework integration
  - Local storage implementation

## 🔄 Continuous Integration

This project includes comprehensive CI/CD pipelines that automatically run on pull requests and pushes:

### What Gets Tested
- **Code Quality**: ESLint linting and TypeScript type checking
- **Unit Tests**: Full test suite with coverage reporting
- **Security**: OWASP Top 10 tests, penetration tests, and dependency audits
- **Build Verification**: Production build validation

### Workflows
- **PR Validation**: Enhanced checks with automated PR comments

### Running Tests Locally
```bash
# Run the full CI suite (same as pipeline)
npm run ci:full

# The ci:full script includes:
npm run lint                 # ESLint linting
npm run test:ci             # Unit tests with coverage
npm run security:test       # All security tests (OWASP + Penetration)

# Additional commands available:
npm run security:audit      # Dependency security audit
npm run security:codeql     # CodeQL static analysis (requires CodeQL CLI)
npm run security:validate   # Validate CodeQL configuration
npm run security:owasp      # OWASP tests only
npm run security:penetration # Penetration tests only
npm run build:prod         # Production build
npm run ci:validate        # Run local validation script
```

For detailed pipeline documentation, see [`.github/PIPELINE.md`](.github/PIPELINE.md).
