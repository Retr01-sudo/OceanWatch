# OceanWatch MVP

A web-based platform for citizens to report oceanic hazards with real-time mapping and geospatial data visualization.

## 🌊 Overview

OceanWatch is a community-driven platform that enables citizens to report oceanic hazards such as high waves, coastal flooding, and unusual tides. The system provides real-time mapping capabilities and helps authorities monitor coastal conditions for early warning systems.

## 🏗️ Architecture

This project uses a monorepo structure with two main packages:

- **backend-api**: Node.js/Express.js API with PostgreSQL and PostGIS
- **web-app**: Next.js/React frontend with Leaflet mapping

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- PostgreSQL 12+ with PostGIS extension
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OceanWatch
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb oceanguard
   
   # Enable PostGIS extension
   psql oceanguard -c "CREATE EXTENSION IF NOT EXISTS postgis;"
   ```

4. **Configure environment variables**
   ```bash
   # Copy environment template
   cp packages/backend-api/env.example packages/backend-api/.env
   
   # Edit the .env file with your database credentials
   nano packages/backend-api/.env
   ```

5. **Run database migration (IMPORTANT - fixes report submission)**
   ```bash
   cd packages/backend-api
   npm run migrate-db
   cd ../..
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

This will start:
- Backend API on http://localhost:3001
- Frontend app on http://localhost:3000

## 🔧 Database Migration

If you're upgrading from an older version, run the migration script to update your database schema:

```bash
cd packages/backend-api
npm run migrate-db
```

This adds the missing fields that were causing "report not submitted" errors.

## 📁 Project Structure

```
oceanguard-mvp/
├── packages/
│   ├── backend-api/          # Express.js API server
│   │   ├── src/
│   │   │   ├── config/       # Database and app configuration
│   │   │   ├── controllers/  # Route controllers
│   │   │   ├── middleware/   # Auth, validation, upload middleware
│   │   │   ├── models/       # Database models
│   │   │   ├── routes/       # API routes
│   │   │   └── server.js     # Main server file
│   │   └── package.json
│   └── web-app/              # Next.js frontend
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── contexts/     # React contexts (Auth)
│       │   ├── pages/        # Next.js pages
│       │   ├── types/        # TypeScript type definitions
│       │   └── utils/        # Utility functions
│       └── package.json
└── package.json              # Root package.json with workspaces
```

## 🔧 Configuration

### Backend Configuration

Edit `packages/backend-api/.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=oceanguard
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=3001
NODE_ENV=development

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
```

### Frontend Configuration

The frontend automatically connects to the backend API. If you need to change the API URL, edit `packages/web-app/src/utils/api.ts`.

## 🗄️ Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password
- `role`: 'citizen' or 'official'
- `created_at`: Timestamp

### Reports Table
- `id`: Primary key
- `user_id`: Foreign key to users table
- `event_type`: Type of hazard (High Waves, Coastal Flooding, etc.)
- `description`: Optional description
- `image_url`: Optional image file path
- `location`: PostGIS geography point (lat/lng)
- `created_at`: Timestamp

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Reports
- `GET /api/reports` - Get all reports (public)
- `GET /api/reports/my` - Get user's reports (authenticated)
- `GET /api/reports/:id` - Get specific report
- `POST /api/reports` - Create new report (authenticated)
- `DELETE /api/reports/:id` - Delete report (owner or official)

## 🎯 Features

### Current MVP Features
- ✅ User registration and authentication
- ✅ JWT-based session management
- ✅ Report submission with geotagging
- ✅ Image upload support
- ✅ Interactive map with Leaflet
- ✅ Real-time report visualization
- ✅ Role-based access (citizen/official)
- ✅ Responsive design with Tailwind CSS

### Planned Features
- 📊 Analytics dashboard for officials
- 🔔 Push notifications for nearby hazards
- 📱 Mobile app
- 🌐 Multi-language support
- 📈 Historical data analysis
- 🚨 Emergency alert system

## 🧪 Testing

### Demo Credentials
- **Citizen**: `citizen@oceanguard.com` / `password`
- **Official**: `admin@oceanguard.com` / `password`

### Sample Data
The database initialization script includes sample reports for Mumbai, Goa, and Chennai to demonstrate the mapping functionality.

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL with PostGIS on your server
2. Configure environment variables for production
3. Run database migrations
4. Deploy with PM2 or similar process manager

### Frontend Deployment
1. Build the Next.js application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred hosting platform
3. Update API URLs for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced analytics and reporting
- [ ] Integration with weather APIs
- [ ] Machine learning for hazard prediction
- [ ] Multi-tenant support for different regions
- [ ] Real-time notifications via WebSocket
- [ ] Advanced mapping features (heatmaps, clustering)
- [ ] Export functionality for reports
- [ ] API rate limiting and caching
- [ ] Comprehensive testing suite

>>>>>>> 44c58e3 (Skeleton_ocenwatch)
>>>>>>> cafdbd91 (Initial commit)
>>>>>>> 095903e4 (initial commit)
