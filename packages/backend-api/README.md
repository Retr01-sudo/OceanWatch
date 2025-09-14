# OceanGuard Backend API

Express.js backend API for the OceanGuard platform with PostgreSQL and PostGIS support.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ with PostGIS extension

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

3. **Initialize database**
   ```bash
   npm run init-db
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📁 Project Structure

```
src/
├── config/
│   ├── database.js      # PostgreSQL connection
│   ├── schema.sql       # Database schema
│   └── init-db.js       # Database initialization
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── reportController.js  # Report management
├── middleware/
│   ├── auth.js          # JWT authentication
│   ├── upload.js        # File upload handling
│   └── validation.js    # Input validation
├── models/
│   ├── User.js          # User model
│   └── Report.js        # Report model
├── routes/
│   ├── auth.js          # Authentication routes
│   └── reports.js       # Report routes
└── server.js            # Main server file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Reports
- `GET /api/reports` - Get all reports
- `GET /api/reports/my` - Get user's reports
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report
- `DELETE /api/reports/:id` - Delete report

## 🗄️ Database

### Setup
```sql
-- Create database
createdb oceanguard

-- Enable PostGIS
psql oceanguard -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### Schema
- **users**: User accounts with roles
- **reports**: Hazard reports with geospatial data

## 🔧 Configuration

Environment variables in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oceanguard
DB_USER=postgres
DB_PASSWORD=password

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development

UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run init-db` - Initialize database with schema and sample data

