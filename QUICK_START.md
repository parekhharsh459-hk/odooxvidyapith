# FleetFlow Quick Start Guide

Get FleetFlow up and running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] MongoDB installed OR MongoDB Atlas account created
- [ ] Git installed (optional)

## Step 1: MongoDB Setup (Choose One)

### Option A: MongoDB Atlas (Easiest - No Installation Required)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a free M0 cluster
4. Create a database user (username + password)
5. Allow access from anywhere (0.0.0.0/0) in Network Access
6. Get your connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fleetflow?retryWrites=true&w=majority
   ```

**See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions**

### Option B: Local MongoDB

1. Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Install MongoDB Community Edition
3. Start MongoDB service
4. Your connection string will be:
   ```
   mongodb://localhost:27017/fleetflow
   ```

## Step 2: Clone & Install

```bash
# Clone the repository (or download ZIP)
git clone <repository-url>
cd fleetflow

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## Step 3: Configure Environment Variables

### Backend Configuration

Create `backend/.env`:

```env
PORT=4000
JWT_SECRET=fleetflow_jwt_secret_change_in_production
GOOGLE_CLIENT_ID=950094395048-dvlld069r4bfet1b58k3gat1fl92vuuj.apps.googleusercontent.com

# MongoDB Configuration
# Use YOUR connection string here:
MONGODB_URI=mongodb://localhost:27017/fleetflow
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fleetflow?retryWrites=true&w=majority
```

### Frontend Configuration

Create `frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=950094395048-dvlld069r4bfet1b58k3gat1fl92vuuj.apps.googleusercontent.com
```

## Step 4: Seed the Database

```bash
cd backend
npm run seed
```

You should see:
```
✅ MongoDB Connected: ...
👥 Seeding users...
✅ Created 4 users
🚛 Seeding vehicles...
✅ Created 5 vehicles
...
🎉 Database seeded successfully!
```

## Step 5: Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected: ...
🚀 FleetFlow API running on port 4000
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 6: Login

Open your browser to `http://localhost:5173`

Use any of these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | manager@fleet.com | fleet123 |
| Dispatcher | dispatch@fleet.com | fleet123 |
| Safety Officer | safety@fleet.com | fleet123 |
| Financial Analyst | finance@fleet.com | fleet123 |

## Troubleshooting

### "MongoDB Connection Error"

**Problem**: Backend can't connect to MongoDB

**Solutions**:
- Verify MongoDB is running (local) or connection string is correct (Atlas)
- Check `MONGODB_URI` in `backend/.env`
- For Atlas: Ensure IP is whitelisted and credentials are correct
- See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed troubleshooting

### "Port 4000 already in use"

**Problem**: Another process is using port 4000

**Solution**:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9
```

Or change the port in `backend/.env`:
```env
PORT=4001
```

### "Cannot find module"

**Problem**: Dependencies not installed

**Solution**:
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Frontend shows "Network Error"

**Problem**: Frontend can't reach backend

**Solutions**:
- Ensure backend is running on port 4000
- Check browser console for errors
- Verify `http://localhost:4000/api/auth/me` returns a response

## Next Steps

1. **Explore the Dashboards**: Login with different roles to see role-specific features
2. **Add Data**: Create new vehicles, drivers, and trips
3. **Customize**: Modify the code to fit your needs
4. **Deploy**: See README.md for deployment instructions

## Useful Commands

```bash
# Backend
npm start          # Start server
npm run dev        # Start with auto-reload (nodemon)
npm run seed       # Seed database with demo data

# Frontend
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
```

## Project Structure

```
fleetflow/
├── backend/
│   ├── db/                 # Database connection & seeding
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── .env               # Environment variables
│   └── server.js          # Express server
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── pages/         # Dashboard pages
│   │   └── App.jsx        # Main app component
│   ├── .env              # Frontend environment variables
│   └── vite.config.js    # Vite configuration
└── README.md             # Full documentation
```

## Support & Documentation

- **Full Documentation**: [README.md](./README.md)
- **MongoDB Setup**: [MONGODB_SETUP.md](./MONGODB_SETUP.md)
- **API Documentation**: See README.md for endpoint details

## Common Issues

### Database is empty after seeding

Run the seed command again:
```bash
cd backend
npm run seed
```

### Google OAuth not working

The demo Google Client ID is for testing only. For production:
1. Create your own Google OAuth credentials
2. Update `GOOGLE_CLIENT_ID` in both `.env` files

### Changes not reflecting

- Backend: Restart the server or use `npm run dev` for auto-reload
- Frontend: Vite should auto-reload, but try refreshing the browser

---

**Need Help?** Check the full [README.md](./README.md) or [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed information.

**Ready to Deploy?** See the Deployment section in [README.md](./README.md).
