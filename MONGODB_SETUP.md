# MongoDB Setup Guide for FleetFlow

This guide will help you set up MongoDB for the FleetFlow application, either locally or using MongoDB Atlas (cloud).

## Option 1: Local MongoDB Installation

### Windows

1. **Download MongoDB Community Edition**
   - Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Select "Windows" and download the MSI installer
   - Run the installer and follow the setup wizard
   - Choose "Complete" installation
   - Install MongoDB as a Windows Service (recommended)

2. **Verify Installation**
   ```cmd
   mongod --version
   ```

3. **Start MongoDB Service**
   ```cmd
   net start MongoDB
   ```

4. **Connection String**
   ```
   mongodb://localhost:27017/fleetflow
   ```

### macOS

1. **Install using Homebrew**
   ```bash
   # Install Homebrew if not already installed
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   
   # Install MongoDB
   brew tap mongodb/brew
   brew install mongodb-community@7.0
   ```

2. **Start MongoDB**
   ```bash
   brew services start mongodb-community@7.0
   ```

3. **Verify Installation**
   ```bash
   mongod --version
   ```

4. **Connection String**
   ```
   mongodb://localhost:27017/fleetflow
   ```

### Linux (Ubuntu/Debian)

1. **Import MongoDB GPG Key**
   ```bash
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   ```

2. **Add MongoDB Repository**
   ```bash
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   ```

3. **Install MongoDB**
   ```bash
   sudo apt-get update
   sudo apt-get install -y mongodb-org
   ```

4. **Start MongoDB**
   ```bash
   sudo systemctl start mongod
   sudo systemctl enable mongod
   ```

5. **Verify Installation**
   ```bash
   mongod --version
   ```

6. **Connection String**
   ```
   mongodb://localhost:27017/fleetflow
   ```

## Option 2: MongoDB Atlas (Cloud - Recommended for Production)

### Step 1: Create Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

### Step 2: Create a Cluster

1. After logging in, click "Build a Database"
2. Choose the **FREE** tier (M0 Sandbox)
3. Select your preferred cloud provider and region
4. Name your cluster (e.g., "FleetFlow-Cluster")
5. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Create Database User

1. In the Security section, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set user privileges to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access

1. In the Security section, click "Network Access"
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add your specific IP addresses
5. Click "Confirm"

### Step 5: Get Connection String

1. Click "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver and version 5.5 or later
5. Copy the connection string

   Example:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. Replace `<username>` and `<password>` with your database user credentials
7. Add the database name after `.net/`: 
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fleetflow?retryWrites=true&w=majority
   ```

## FleetFlow Configuration

### 1. Update Backend .env File

Edit `backend/.env`:

```env
# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/fleetflow

# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fleetflow?retryWrites=true&w=majority
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Seed the Database

```bash
npm run seed
```

This will create:
- 4 demo users (Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
- 5 vehicles
- 5 drivers
- Sample trips, maintenance logs, fuel logs, and incidents

### 4. Start the Server

```bash
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
🚀 FleetFlow API running on port 4000
```

## Troubleshooting

### Connection Refused Error

**Problem**: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
- Ensure MongoDB service is running
- Windows: `net start MongoDB`
- macOS: `brew services start mongodb-community`
- Linux: `sudo systemctl start mongod`

### Authentication Failed (Atlas)

**Problem**: `MongoServerError: bad auth : authentication failed`

**Solution**:
- Verify username and password in connection string
- Ensure special characters in password are URL-encoded
- Check that database user has correct permissions

### Network Timeout (Atlas)

**Problem**: `MongoNetworkTimeoutError: connection timed out`

**Solution**:
- Check Network Access whitelist in Atlas
- Ensure your IP address is allowed
- Try "Allow Access from Anywhere" for testing

### Database Not Found

**Problem**: Database doesn't exist after seeding

**Solution**:
- MongoDB creates databases automatically on first write
- Run `npm run seed` to populate the database
- Check connection string has correct database name

## MongoDB GUI Tools (Optional)

### MongoDB Compass (Official)

1. Download from [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Install and open
3. Connect using your connection string
4. Browse collections, run queries, and visualize data

### Studio 3T (Third-party)

1. Download from [Studio 3T](https://studio3t.com/)
2. Free for non-commercial use
3. Advanced query builder and data import/export

## Useful MongoDB Commands

### Using MongoDB Shell (mongosh)

```bash
# Connect to local MongoDB
mongosh

# Connect to Atlas
mongosh "mongodb+srv://cluster0.xxxxx.mongodb.net/fleetflow" --username your_username

# Show databases
show dbs

# Use FleetFlow database
use fleetflow

# Show collections
show collections

# Count documents in a collection
db.users.countDocuments()

# Find all users
db.users.find()

# Find specific user
db.users.findOne({ email: "manager@fleet.com" })

# Drop database (careful!)
db.dropDatabase()
```

## Security Best Practices

### For Production:

1. **Strong Passwords**: Use complex passwords for database users
2. **IP Whitelist**: Only allow specific IP addresses
3. **Environment Variables**: Never commit `.env` files to version control
4. **Connection Encryption**: Always use SSL/TLS (Atlas uses this by default)
5. **Regular Backups**: Enable automated backups in Atlas
6. **Monitoring**: Set up alerts for unusual activity

### Connection String Security:

```bash
# ❌ Bad - Hardcoded in code
const uri = "mongodb+srv://user:pass@cluster.net/db";

# ✅ Good - Using environment variables
const uri = process.env.MONGODB_URI;
```

## Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB University (Free Courses)](https://university.mongodb.com/)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review MongoDB logs
3. Verify connection string format
4. Ensure all environment variables are set correctly

---

**Last Updated**: February 21, 2026
