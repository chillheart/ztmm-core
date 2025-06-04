# ZTMM Assessment Tool

A comprehensive Zero Trust Maturity Model (ZTMM) assessment application built with Angular and Electron. This desktop application helps organizations evaluate their Zero Trust implementation maturity across different pillars, functions, capabilities, and technologies.

## 🚀 Features

### Core Functionality
- **📊 Assessment Management**: Conduct maturity assessments against the Zero Trust framework
- **🏗️ Configuration Management**: Define and manage Zero Trust pillars, functions/capabilities, and technologies/processes
- **📈 Progress Tracking**: Visual progress indicators and completion tracking
- **📋 Results Dashboard (WIP)** : View and analyze assessment results with detailed reporting

### User Interface
- **🎨 Modern Bootstrap UI**: Clean, responsive design with Bootstrap 5
- **🔧 Configuration Section**: Intuitive admin interface with tabbed navigation
- **📱 Responsive Design**: Works seamlessly across different screen sizes
- **🖱️ Interactive Features**: Drag-and-drop reordering, inline editing, and form validation

### Technical Features
- **💾 SQLite Database**: Local data persistence with relational data structure
- **🔄 Real-time Updates**: Live data synchronization between UI and database
- **✅ Data Validation**: Comprehensive form validation and error handling
- **🗑️ Cascading Deletes**: Safe data management with relationship integrity

## 🛠️ Technology Stack

- **Frontend**: Angular 19.2 with TypeScript
- **Desktop Framework**: Electron 36.3
- **UI Framework**: Bootstrap 5.3 with Bootstrap Icons
- **Database**: SQLite with better-sqlite3
- **Styling**: SCSS with responsive design

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ztmm-assessment
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Rebuild native dependencies for Electron:
   ```bash
   npm run electron:rebuild
   ```

## 🚀 Running the Application

### Electron Desktop App
Build and run as a desktop application:
```bash
npm run electron
```

## 📖 Usage Guide

### 1. Configuration Setup
Navigate to the Configuration section (gear icon) to set up your ZTMM framework:

- **Pillars**: Define Zero Trust pillars (e.g., Identity, Device, Network)
- **Functions/Capabilities**: Add functions and capabilities for each pillar
- **Technologies/Processes**: Define specific technologies and processes for assessment

### 2. Conducting Assessments
1. Go to the Assessment section
2. Select a pillar to assess
3. Review the progress summary table
4. Click "Assess" for each function/capability
5. Rate each technology/process implementation status
6. Add optional notes for context

### 3. Viewing Results
Access the Results section to:
- View completed assessments
- Analyze maturity scores
- Export assessment data

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/          # Angular components
│   │   ├── admin.component.*        # Configuration management
│   │   ├── assessment.component.*   # Assessment interface
│   │   ├── results.component.*      # Results dashboard
│   │   ├── navbar.component.*       # Navigation
│   │   └── home.component.*         # Landing page
│   ├── models/              # TypeScript interfaces
│   │   └── ztmm.models.ts          # Data models
│   ├── services/            # Angular services
│   │   └── ztmm-data.service.ts    # Data access layer
│   └── styles.scss          # Global styles
├── main.js                  # Electron main process
├── preload.js              # Electron preload script
└── ztmm.db                 # SQLite database
```

## 🗄️ Database Schema

The application uses SQLite with the following tables:
- `pillars` - Zero Trust pillars
- `function_capabilities` - Functions and capabilities
- `maturity_stages` - Maturity level definitions
- `technologies_processes` - Technologies and processes
- `assessment_responses` - Assessment results

## 🔧 Development

### Code Scaffolding
Generate new components:
```bash
ng generate component component-name
```

### Building for Production

TODO: Create Production deployment process


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

- **v0.0.1**: Initial commit with core ZTMM assessment functionality
- Configuration management with drag-and-drop reordering
- Pillar-based assessment workflow with progress tracking
