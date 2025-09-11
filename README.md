# ZTMM Assessment Tool

A compreensive Zero Trust Maturity Model (ZTMM) assessment application built with Angular. This web-based application helps organizations evaluate their Zero Trust implementation maturity across different pillars and technologies.

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

### Cloudflare Pages Deployment

The project is now hosted on Cloudflare Pages.

#### Automated Deployment
- Pushes and merges to the main branch are automatically deployed to Cloudflare Pages using its integration.
- For details on configuring Cloudflare Pages, visit [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/).

#### Manual Deployment
To manually deploy:
1. Build the production version:
   ```bash
   npm run build:prod
   ```
2. Upload the contents of the `dist/` directory to your Cloudflare Pages project.

#### Custom Domain
- The application is available at: [https://ztmm-assessment.pages.dev](https://ztmm-assessment.pages.dev)
- For custom domain setup, follow Cloudflare Pages custom domain guide.

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

You can try the application online at: [Cloudflare Pages Demo](https://ztmm-assessment.pages.dev)

## 🏠 Self-Hosting

Want to host this tool for your organization? 
1. Fork this repository
2. Customize the configuration as needed
3. Deploy to your preferred hosting platform:
   - **Cloudflare Pages**: See above for deployment steps
   - **Netlify**: Connect your repository for automatic deployments
   - **Vercel**: Import your repository for instant deployment
   - **Static Web Hosting**: Upload the `dist/` folder contents

## 🧪 Testing

Run the test suite:
```bash
npm test
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
