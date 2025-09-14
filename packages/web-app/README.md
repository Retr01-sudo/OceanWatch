# OceanGuard Web App

Next.js frontend application for the OceanGuard platform with interactive mapping and real-time hazard reporting.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running on port 3001

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.tsx              # Navigation component
│   ├── MapDashboard.tsx        # Interactive map with reports
│   └── ReportSubmissionForm.tsx # Report creation form
├── contexts/
│   └── AuthContext.tsx         # Authentication state management
├── pages/
│   ├── _app.tsx               # App wrapper with providers
│   ├── index.tsx              # Landing page
│   ├── login.tsx              # Login page
│   ├── register.tsx           # Registration page
│   └── dashboard.tsx          # Main dashboard with map
├── types/
│   └── index.ts               # TypeScript type definitions
└── utils/
    └── api.ts                 # API client functions
```

## 🎯 Features

- **Interactive Map**: Leaflet-based map showing hazard reports
- **Real-time Updates**: Live report visualization
- **Geolocation**: Automatic location detection for reports
- **Image Upload**: Support for report images
- **Responsive Design**: Mobile-friendly interface
- **Authentication**: JWT-based user management
- **Role-based Access**: Citizen and official roles

## 🗺️ Mapping

The app uses Leaflet with react-leaflet for interactive mapping:

- **Map Provider**: OpenStreetMap tiles
- **Markers**: Color-coded by hazard type
- **Popups**: Report details on marker click
- **Geolocation**: Browser location API integration

## 🎨 Styling

Built with Tailwind CSS for modern, responsive design:

- **Custom Colors**: Ocean-themed color palette
- **Components**: Reusable UI components
- **Responsive**: Mobile-first design approach

## 🔧 Configuration

### API Connection
The app connects to the backend API. Update the API URL in `src/utils/api.ts` if needed:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
```

### Environment Variables
Create `.env.local` for custom configuration:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📱 Pages

### Landing Page (`/`)
- Hero section with app introduction
- Feature highlights
- Call-to-action buttons

### Authentication (`/login`, `/register`)
- User registration and login forms
- Form validation
- Demo credentials display

### Dashboard (`/dashboard`)
- Interactive map with all reports
- Report submission form
- Report details sidebar
- User navigation

## 🧪 Testing

### Demo Credentials
- **Citizen**: `citizen@oceanguard.com` / `password`
- **Official**: `admin@oceanguard.com` / `password`

### Sample Data
The backend includes sample reports for testing the mapping functionality.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push

### Other Platforms
1. Build the app: `npm run build`
2. Deploy the `.next` folder to your hosting platform
3. Configure environment variables

## 🔧 Development

### Adding New Features
1. Create components in `src/components/`
2. Add pages in `src/pages/`
3. Update types in `src/types/`
4. Add API functions in `src/utils/api.ts`

### Styling Guidelines
- Use Tailwind CSS classes
- Follow the ocean color theme
- Ensure responsive design
- Use semantic HTML elements

