# OceanWatch 🌊

**A professional web-based platform for real-time oceanic hazard reporting and monitoring**

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue.svg)](https://postgresql.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

OceanWatch is a comprehensive full-stack web application designed to enhance coastal safety through community-driven reporting and official monitoring of oceanic hazards. The platform enables citizens and officials to report, track, and manage dangerous marine conditions with precise geolocation data and real-time visualization.

### Why OceanWatch?

- **🚨 Early Warning System**: Community-powered hazard detection for faster emergency response
- **📊 Centralized Monitoring**: Single platform for all oceanic hazard data and analytics
- **🗺️ Real-time Visualization**: Interactive maps with severity-based color coding
- **👥 Community Safety**: Connecting citizens, officials, and emergency services
- **📱 Mobile-First**: Optimized for field reporting and emergency situations

## ✨ Features

### Core Functionality
- **Interactive Map Dashboard**: Real-time hazard visualization with PostGIS-powered geospatial queries
- **Geotagged Reporting**: GPS-accurate hazard reporting with location validation for Indian coastal regions
- **Role-Based Access Control**: Separate interfaces for citizens and government officials
- **Severity Classification**: Four-tier system (Low, Medium, High, Critical) with color-coded markers
- **Report Verification**: Official verification workflow for data accuracy
- **Real-time Updates**: Live synchronization of new reports and status changes

### Advanced Features
- **Professional UI**: Government-grade interface with comprehensive icon system
- **Image Documentation**: Secure file upload with validation and storage
- **Analytics Dashboard**: Statistical insights and hazard trend analysis
- **Emergency Contacts**: Quick access to Coast Guard, NDRF, and emergency services
- **Database Migration**: Safe schema updates and data migration tools
- **Production-Ready**: No dummy data generation, clean production deployment

### Technical Highlights
- **PostGIS Integration**: Advanced geospatial data handling and geographic queries
- **JWT Authentication**: Secure session management with role-based permissions
- **TypeScript Support**: Type-safe development with comprehensive type definitions
- **Responsive Design**: Mobile-optimized for field reporting scenarios
- **RESTful API**: Well-structured API endpoints with proper error handling

## 🚀 Installation

### Prerequisites

**System Requirements:**
- Node.js 18.0.0+ 
- npm 8.0.0+
- PostgreSQL 12.0+ with PostGIS extension
- Git for version control

### Windows Setup

1. **Install Node.js**
   ```powershell
   # Download from https://nodejs.org/ (LTS version recommended)
   # Verify installation
   node --version
   npm --version
   ```

2. **Install PostgreSQL with PostGIS**
   ```powershell
   # Download from https://www.postgresql.org/download/windows/
   # During installation, note your postgres password
   
   # Open pgAdmin or psql and run:
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

3. **Clone and Setup Project**
   ```powershell
   git clone https://github.com/yourusername/OceanWatch.git
   cd OceanWatch
   
   # Automated setup (recommended)
   .\setup.sh
   
   # Manual setup alternative:
   npm install
   cd packages\backend-api && npm install && cd ..\..
   cd packages\web-app && npm install && cd ..\..
   ```

### Linux Setup

1. **Install Node.js**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # CentOS/RHEL/Fedora
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo dnf install -y nodejs npm
   
   # Verify installation
   node --version && npm --version
   ```

2. **Install PostgreSQL with PostGIS**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install postgresql postgresql-contrib postgis postgresql-14-postgis-3
   
   # CentOS/RHEL/Fedora
   sudo dnf install postgresql postgresql-server postgresql-contrib postgis
   sudo postgresql-setup --initdb
   sudo systemctl enable --now postgresql
   ```

3. **Setup Database**
   ```bash
   # Create database as postgres user
   sudo -u postgres createdb oceanguard
   sudo -u postgres psql oceanguard -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

4. **Clone and Setup Project**
   ```bash
   git clone https://github.com/yourusername/OceanWatch.git
   cd OceanWatch
   
   # Run automated setup
   chmod +x setup.sh
   ./setup.sh
   ```

### Environment Configuration

1. **Configure Backend Environment**
   ```bash
   cd packages/backend-api
   cp env.example .env
   ```

2. **Edit `.env` with your settings:**
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=oceanguard
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   
   # JWT Security
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # File Upload Settings
   UPLOAD_DIR=uploads
   MAX_FILE_SIZE=5242880
   ```

3. **Initialize Database Schema**
   ```bash
   # From project root
   cd packages/backend-api
   npm run init-db
   cd ../..
   ```

## 🎯 Usage

### Quick Start

1. **Start Development Environment**
   ```bash
   # Start both backend and frontend concurrently
   npm run dev
   
   # Or start services individually:
   npm run dev:backend   # API server on http://localhost:3001
   npm run dev:frontend  # Web app on http://localhost:3000
   ```

2. **Access the Application**
   - **Main Application**: http://localhost:3000
   - **API Health Check**: http://localhost:3001/health
   - **API Documentation**: http://localhost:3001/api

### Demo Accounts

```
👤 Citizen Account:
   Email: citizen@oceanguard.com
   Password: password

🏛️ Official Account:
   Email: admin@oceanguard.com
   Password: password
```

### API Reference

#### Authentication Endpoints
```bash
POST /api/auth/register    # User registration
POST /api/auth/login       # User authentication
GET  /api/auth/profile     # Get user profile
```

#### Report Management
```bash
GET    /api/reports        # Fetch all reports
POST   /api/reports        # Create new report
GET    /api/reports/:id    # Get specific report
PUT    /api/reports/:id    # Update report (officials only)
DELETE /api/reports/:id    # Delete report (admin only)
```

### Production Deployment

```bash
# Build applications for production
npm run build

# Start production servers
cd packages/backend-api && npm start &
cd packages/web-app && npm start &
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | PostgreSQL server host | localhost | ✅ |
| `DB_PORT` | PostgreSQL server port | 5432 | ✅ |
| `DB_NAME` | Database name | oceanguard | ✅ |
| `DB_USER` | Database username | postgres | ✅ |
| `DB_PASSWORD` | Database password | - | ✅ |
| `JWT_SECRET` | JWT signing secret | - | ✅ |
| `JWT_EXPIRES_IN` | Token expiration time | 7d | ❌ |
| `PORT` | API server port | 3001 | ❌ |
| `NODE_ENV` | Environment mode | development | ❌ |
| `UPLOAD_DIR` | File upload directory | uploads | ❌ |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 5242880 | ❌ |

### Database Management

```bash
# Initialize fresh database with schema
npm run init-db

# Migrate existing database to latest schema
npm run migrate-db

# Reset database (⚠️ destructive operation)
npm run init-db  # Will prompt for confirmation
```

## 📁 Project Structure

```
OceanWatch/
├── 📁 packages/
│   ├── 📁 backend-api/              # Express.js REST API
│   │   ├── 📁 src/
│   │   │   ├── 📁 config/          # Database & app configuration
│   │   │   │   ├── init-db.js      # Database initialization
│   │   │   │   ├── migrate-db.js   # Schema migration tool
│   │   │   │   └── schema.sql      # PostgreSQL schema with PostGIS
│   │   │   ├── 📁 controllers/     # Request handlers
│   │   │   ├── 📁 middleware/      # Express middleware
│   │   │   ├── 📁 models/          # Database models
│   │   │   ├── 📁 routes/          # API route definitions
│   │   │   ├── 📁 services/        # Business logic layer
│   │   │   └── server.js           # Main application server
│   │   ├── 📁 tests/               # API test suites
│   │   ├── 📁 uploads/             # File storage directory
│   │   └── env.example             # Environment template
│   └── 📁 web-app/                 # Next.js frontend application
│       ├── 📁 src/
│       │   ├── 📁 components/      # Reusable React components
│       │   │   ├── 📁 icons/       # Professional icon system
│       │   │   ├── MapView.tsx     # Interactive map component
│       │   │   ├── DashboardLayout.tsx
│       │   │   └── ...             # Feature-specific components
│       │   ├── 📁 contexts/        # React context providers
│       │   ├── 📁 pages/           # Next.js page components
│       │   │   ├── dashboard.tsx   # Main dashboard interface
│       │   │   ├── report.tsx      # Report submission page
│       │   │   └── map.tsx         # Full-screen map view
│       │   ├── 📁 services/        # API integration services
│       │   ├── 📁 styles/          # Global CSS and Tailwind
│       │   ├── 📁 types/           # TypeScript type definitions
│       │   └── 📁 utils/           # Helper functions
│       └── 📁 public/              # Static assets
├── 📄 setup.sh                     # Automated setup script
├── 📄 test-report-submission.js    # Testing utilities
├── 📄 package.json                 # Workspace configuration
└── 📚 Documentation/               # Project documentation
    ├── MAP_SYSTEM_DOCUMENTATION.md
    ├── CRITICAL_FIXES_DOCUMENTATION.md
    └── UI_IMPROVEMENTS_DOCUMENTATION.md
```

### Architecture Overview

- **Backend**: Express.js REST API with PostgreSQL/PostGIS database
- **Frontend**: Next.js React application with TypeScript
- **Database**: PostgreSQL with PostGIS for geospatial data
- **Authentication**: JWT-based with role-based access control
- **File Storage**: Local filesystem with Multer middleware
- **Maps**: Leaflet with OpenStreetMap tiles and custom markers

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/OceanWatch.git
   cd OceanWatch
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Development Setup**
   ```bash
   # Install dependencies
   npm install
   
   # Start development environment
   npm run dev
   ```

4. **Code Quality**
   ```bash
   # Backend testing
   cd packages/backend-api && npm test
   
   # Frontend linting
   cd packages/web-app && npm run lint
   ```

5. **Submit Pull Request**
   - Clear description of changes
   - Include screenshots for UI modifications
   - Reference related issues
   - Ensure all tests pass

### Coding Standards

- **Backend**: Node.js best practices, ESLint configuration
- **Frontend**: React/Next.js conventions, TypeScript strict mode
- **Database**: Proper SQL formatting, indexing strategies
- **Git**: Conventional commit messages (`feat:`, `fix:`, `docs:`)

### Issue Guidelines

Include in bug reports:
- Environment details (OS, Node.js, PostgreSQL versions)
- Reproduction steps
- Expected vs actual behavior
- Error logs and screenshots
- Browser information (for frontend issues)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for complete details.

## 🙏 Acknowledgments

### Core Technologies
- **[Express.js](https://expressjs.com/)** - Fast, unopinionated web framework
- **[Next.js](https://nextjs.org/)** - Production-ready React framework
- **[PostgreSQL](https://postgresql.org/)** - Advanced open-source database
- **[PostGIS](https://postgis.net/)** - Spatial database extension
- **[Leaflet](https://leafletjs.com/)** - Open-source interactive maps
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Development Tools
- **[TypeScript](https://typescriptlang.org/)** - Type-safe JavaScript
- **[React](https://reactjs.org/)** - Component-based UI library
- **[Axios](https://axios-http.com/)** - HTTP client library
- **[Multer](https://github.com/expressjs/multer)** - File upload middleware
- **[JWT](https://jwt.io/)** - JSON Web Token standard

### Data Sources
- **[OpenStreetMap](https://openstreetmap.org/)** - Collaborative mapping data
- **[Nominatim](https://nominatim.org/)** - Geocoding service
- **[Lucide](https://lucide.dev/)** - Beautiful icon library

---

**🌊 Built with passion for ocean safety and community protection**

*For support, questions, or feature requests, please [open an issue](https://github.com/yourusername/OceanWatch/issues) or contact our development team.*
