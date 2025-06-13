# ZTMM Assessment Tool

[![CI Pipeline](https://github.com/chillheart/ztmm-assessment/workflows/PR%20Validation/badge.svg)](https://github.com/chillheart/ztmm-assessment/actions/workflows/pr-validation.yml)
[![Deploy to GitHub Pages](https://github.com/chillheart/ztmm-assessment/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)](https://github.com/chillheart/ztmm-assessment/actions/workflows/deploy-github-pages.yml)

A comprehensive Zero Trust Maturity Model (ZTMM) assessment application built with Angular. This web-based application helps organizations evaluate their Zero Trust implementation maturity across different pillars, functions, capabilities, and technologies with complete privacy - all data is stored locally in your browser.

## 🚀 Features

### Core Functionality
- **📊 Assessment Management**: Conduct maturity assessments against the Zero Trust framework
- **🏗️ Configuration Management**: Define and manage Zero Trust pillars, functions/capabilities, and technologies/processes
- **📈 Progress Tracking**: Visual progress indicators and completion tracking
- **📋 Results Dashboard**: View and analyze assessment results with detailed reporting and PDF export
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
- **Export**: jsPDF for report generation
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

### 3. Viewing Results
Access the Results section to:
- View completed assessments with visual indicators
- Analyze maturity scores across pillars
- Export assessment reports to PDF
- Track progress over time

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

```
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── admin.component.*        # Configuration management
│   │   ├── assessment.component.*   # Assessment interface
│   │   ├── results.component.*      # Results dashboard
│   │   ├── navbar.component.*       # Navigation
│   │   └── home.component.*         # Landing page with instructions
│   ├── admin/               # Admin/Configuration sub-components
│   │   ├── pillars-tab.component.*     # Pillar management
│   │   ├── functions-tab.component.*   # Function/capability management
│   │   ├── technologies-tab.component.* # Technology/process management
│   │   └── data-management-tab.component.* # Import/export functionality
│   ├── models/              # TypeScript interfaces
│   │   └── ztmm.models.ts          # Data models and interfaces
│   ├── services/            # Angular services
│   │   ├── indexeddb.service.ts        # IndexedDB database service
│   │   ├── ztmm-data-web.service.ts    # Main data access layer
│   │   └── pdf-export.service.ts       # PDF report generation
│   └── styles.scss          # Global styles
└── assets/                  # Static assets (icons, images)
```

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

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For questions, issues, or feature requests, please create an issue in the repository.

## 🔄 Version History

- **v1.2.0**: Switched to using native IndexedDB APIs
  - Updated home page to include instructions and privacy statement
- **v1.1.0**: Web-based application with IndexedDB storage
  - Complete privacy with local browser storage
  - Enhanced UI with getting started guide
  - PDF export functionality
  - Import/export for data management
  - Comprehensive test coverage
- **v1.0.0**: Initial release with core ZTMM assessment functionality
  - Configuration management with drag-and-drop reordering
  - Pillar-based assessment workflow with progress tracking

## 🔄 Continuous Integration

This project includes comprehensive CI/CD pipelines that automatically run on pull requests and pushes:

### What Gets Tested
- **Code Quality**: ESLint linting and TypeScript type checking
- **Unit Tests**: Full test suite with coverage reporting
- **Security**: OWASP Top 10 tests, penetration tests, and dependency audits
- **Build Verification**: Production build validation
- **Static Analysis**: CodeQL security scanning
- **Vulnerability Scanning**: Trivy filesystem scanning

### Workflows
- **CI Pipeline**: Runs on all pushes and pull requests to `main`/`develop` 
- **PR Validation**: Enhanced checks with automated PR comments
- **Security Scanning**: CodeQL and Trivy vulnerability detection
- **Auto Deployment**: GitHub Pages deployment on releases

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
