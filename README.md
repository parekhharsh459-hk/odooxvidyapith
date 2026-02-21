# FleetFlow Logistics — Enterprise Dashboard

FleetFlow is a state-of-the-art logistics management platform designed for fleet operators. It features a professional corporate UI, robust role-based access control, and a full-stack architecture with MongoDB database.

## 🚀 Features
- **Centralized Command Center**: Real-time KPI tracking and operational metrics.
- **Vehicle Registry**: Complete lifecycle management of fleet assets.
- **Trip Oversight**: Dispatch management with driver and vehicle validation.
- **Maintenance Logs**: Preventive and corrective service tracking.
- **Driver Profiles**: Compliance tracking and safety score monitoring.
- **Fuel & Expenses**: Detailed cost analysis and fuel logging.
- **Financial Analytics**: ROI reports and operational cost analysis.
- **Safety Management**: Incident reporting and driver compliance monitoring.
- **Modular Backend**: Node.js/Express API with JWT authentication and MongoDB persistence.

## 🛠️ Technology Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, JWT, Bcrypt
- **Database**: MongoDB with Mongoose ODM
- **Auth**: Built-in credential auth + Google OAuth 2.0

## 📦 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5.0 or higher) - Local installation or MongoDB Atlas
- Google Cloud Console Client ID (for OAuth)

### 2. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```
3. MongoDB will run on `mongodb://localhost:27017` by default

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (replace `<password>` with your database user password)
4. Whitelist your IP address in Network Access

### 3. Environment Setup

#### Backend Environment Variables
Create a `.env` file in the `backend/` folder:

```env
PORT=4000
JWT_SECRET=your_jwt_secret_change_in_production
GOOGLE_CLIENT_ID=your_google_client_id

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/fleetflow

# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/fleetflow?retryWrites=true&w=majority
```

#### Frontend Environment Variables
Create a `.env` file in the `frontend/` folder:

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Installation & Running

#### Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

#### Seed Database (First Time Only)
```bash
cd backend
npm run seed
```

This will populate your MongoDB database with:
- 4 demo users (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
- 5 vehicles
- 5 drivers
- Sample trips, maintenance logs, fuel logs, and incidents

#### Start Backend (Port 4000)
```bash
cd backend
npm start

# Or for development with auto-reload:
npm run dev
```

#### Start Frontend (Port 5173/5174)
```bash
cd frontend
npm run dev
```

### 5. Default Login Credentials

After seeding the database, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | manager@fleet.com | fleet123 |
| Dispatcher | dispatch@fleet.com | fleet123 |
| Safety Officer | safety@fleet.com | fleet123 |
| Financial Analyst | finance@fleet.com | fleet123 |

## 📂 Project Structure

```
fleetflow/
├── backend/
│   ├── db/
│   │   ├── connection.js      # MongoDB connection
│   │   ├── seed.js            # Database seeding script
│   │   └── store.js           # Data access layer
│   ├── models/                # Mongoose models
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Driver.js
│   │   ├── Trip.js
│   │   ├── Maintenance.js
│   │   ├── Fuel.js
│   │   ├── Activity.js
│   │   └── Incident.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   └── fleet.js
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── .env                   # Environment variables
│   ├── package.json
│   └── server.js              # Express server
├── frontend/
│   ├── src/
│   │   ├── api/               # API client functions
│   │   ├── pages/             # Dashboard pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env                   # Frontend environment variables
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔒 Security Features
- Role-Based Access Control (RBAC)
- JWT-protected API endpoints
- Password hashing using Bcrypt
- Google OAuth 2.0 integration
- Protected routes with authentication middleware

## 🎨 Dashboard Features by Role

### Fleet Manager
- Complete system access
- Vehicle registry management
- Trip oversight and analytics
- Financial reports
- Operational analytics

### Dispatcher
- Trip management and dispatch
- Vehicle availability tracking
- Driver assignment
- Real-time trip status updates

### Safety Officer
- Driver compliance monitoring
- License expiry tracking
- Safety score management
- Incident reporting and resolution

### Financial Analyst
- Fuel cost analysis
- Maintenance cost tracking
- ROI reports
- Operational analytics
- CSV export functionality

## 🗄️ Database Schema

The application uses MongoDB with the following collections:
- `users` - User accounts and authentication
- `vehicles` - Fleet vehicle information
- `drivers` - Driver profiles and compliance data
- `trips` - Trip records and dispatch history
- `maintenances` - Maintenance service logs
- `fuels` - Fuel transaction records
- `activities` - System activity logs
- `incidents` - Safety incident reports

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas for production database
2. Update `MONGODB_URI` in production environment
3. Deploy to services like Heroku, Railway, or AWS
4. Ensure environment variables are set

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to Vercel, Netlify, or similar services
3. Update API endpoint in frontend configuration

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `POST /api/vehicles` - Create vehicle
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle

### Fleet Management
- `GET /api/drivers` - Get all drivers
- `GET /api/trips` - Get all trips
- `GET /api/maintenance` - Get maintenance logs
- `GET /api/fuel` - Get fuel logs
- `GET /api/incidents` - Get incident reports
- `GET /api/analytics/financial` - Get financial analytics

## 🤝 Contributing
Contributions are welcome! Please follow the existing code style and add tests for new features.

## 📄 License
This project is licensed under the ISC License.

---
Built by FleetFlow Logistics Development Team.
