# MongoDB Atlas Connection Troubleshooting

## Current Issue

Your MongoDB Atlas connection is failing with:
```
Error: querySrv ECONNREFUSED _mongodb._tcp.cluster0.zdzwikf.mongodb.net
```

This means the application cannot reach your MongoDB Atlas cluster.

## Quick Fix Steps

### Step 1: Configure IP Whitelist in MongoDB Atlas

1. **Go to MongoDB Atlas** ([cloud.mongodb.com](https://cloud.mongodb.com))
2. **Login** with your account
3. **Select your project** (where Cluster0 is located)
4. **Click "Network Access"** in the left sidebar (under Security)
5. **Click "Add IP Address"** button
6. **Choose one of these options:**

   **Option A: Allow from Anywhere (Easiest for Testing)**
   - Click "Allow Access from Anywhere"
   - This adds `0.0.0.0/0` to the whitelist
   - Click "Confirm"
   - ⚠️ Note: This is fine for development but not recommended for production

   **Option B: Add Your Current IP**
   - Click "Add Current IP Address"
   - It will auto-detect your IP
   - Click "Confirm"

7. **Wait 1-2 minutes** for the changes to propagate

### Step 2: Verify Connection String

Your connection string is:
```
mongodb+srv://parekhharsh459_db_user:pzAHIW0iZaSqImmU@cluster0.zdzwikf.mongodb.net/fleetflow?retryWrites=true&w=majority&appName=Cluster0
```

This looks correct! ✅

### Step 3: Test Connection Again

After configuring the IP whitelist, run:

```bash
cd backend
node test-connection.js
```

You should see:
```
✅ SUCCESS! MongoDB Connected
Host: cluster0-shard-00-00.zdzwikf.mongodb.net
Database: fleetflow
```

### Step 4: Seed the Database

Once the connection test passes:

```bash
npm run seed
```

### Step 5: Start the Backend

```bash
npm start
```

## Alternative Solutions

### If IP Whitelist Doesn't Work

#### Solution 1: Check Firewall/Antivirus

Your firewall or antivirus might be blocking MongoDB connections:

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js if not already allowed
4. Allow both Private and Public networks

**Antivirus:**
- Temporarily disable antivirus and test
- If it works, add an exception for Node.js

#### Solution 2: Use VPN

If you're behind a corporate firewall or restrictive network:
1. Connect to a VPN
2. Try the connection again

#### Solution 3: Try Standard Connection String

If SRV lookup fails, try the standard format:

1. **Get Standard Connection String from Atlas:**
   - Go to your cluster in Atlas
   - Click "Connect"
   - Choose "Connect your application"
   - Select "Standard connection string" instead of SRV

2. **Update backend/.env:**
   ```env
   MONGODB_URI=mongodb://parekhharsh459_db_user:pzAHIW0iZaSqImmU@cluster0-shard-00-00.zdzwikf.mongodb.net:27017,cluster0-shard-00-01.zdzwikf.mongodb.net:27017,cluster0-shard-00-02.zdzwikf.mongodb.net:27017/fleetflow?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
   ```

#### Solution 4: Check DNS Resolution

Test if your system can resolve MongoDB Atlas DNS:

**Windows:**
```cmd
nslookup cluster0.zdzwikf.mongodb.net
```

**If DNS fails:**
- Try using Google DNS (8.8.8.8)
- Or Cloudflare DNS (1.1.1.1)

**Change DNS on Windows:**
1. Open Network Connections
2. Right-click your network adapter
3. Properties → Internet Protocol Version 4
4. Use these DNS servers:
   - Preferred: 8.8.8.8
   - Alternate: 8.8.4.4

## Verification Checklist

- [ ] IP address whitelisted in MongoDB Atlas Network Access
- [ ] Waited 1-2 minutes after adding IP
- [ ] Firewall allows Node.js connections
- [ ] Internet connection is working
- [ ] Can access other websites normally
- [ ] Not behind corporate proxy/firewall
- [ ] Connection string is correct in .env file

## Testing Commands

```bash
# Test connection
cd backend
node test-connection.js

# If successful, seed database
npm run seed

# Start backend
npm start
```

## Expected Success Output

### Connection Test:
```
✅ SUCCESS! MongoDB Connected
Host: cluster0-shard-00-00.zdzwikf.mongodb.net
Database: fleetflow
📦 Collections: 0
✅ Connection test completed successfully!
```

### Seed Script:
```
✅ MongoDB Connected: cluster0-shard-00-00.zdzwikf.mongodb.net
🗑️  Clearing existing data...
👥 Seeding users...
✅ Created 4 users
🚛 Seeding vehicles...
✅ Created 5 vehicles
...
🎉 Database seeded successfully!
```

### Backend Start:
```
✅ MongoDB Connected: cluster0-shard-00-00.zdzwikf.mongodb.net
🚀 FleetFlow API running on port 4000
```

## Still Having Issues?

### Check MongoDB Atlas Status

1. Go to [status.mongodb.com](https://status.mongodb.com)
2. Check if there are any ongoing incidents

### Contact Information

If none of these solutions work:

1. **Check your MongoDB Atlas cluster status:**
   - Ensure the cluster is running (not paused)
   - Check cluster health in Atlas dashboard

2. **Verify your account:**
   - Ensure your MongoDB Atlas account is active
   - Check if you have any billing issues

3. **Try creating a new cluster:**
   - Sometimes cluster configuration issues require a fresh start
   - Create a new M0 (free) cluster
   - Get the new connection string

## Common Error Messages

### `ECONNREFUSED`
- **Cause**: IP not whitelisted or firewall blocking
- **Fix**: Add IP to whitelist, check firewall

### `Authentication failed`
- **Cause**: Wrong username or password
- **Fix**: Verify credentials in connection string

### `Network timeout`
- **Cause**: Network connectivity issues
- **Fix**: Check internet, try VPN

### `querySrv ENOTFOUND`
- **Cause**: DNS resolution failure
- **Fix**: Change DNS servers, use standard connection string

## Next Steps After Connection Works

1. ✅ Run `npm run seed` to populate database
2. ✅ Run `npm start` to start backend
3. ✅ Run `npm run dev` in frontend folder
4. ✅ Open `http://localhost:5173` and login

---

**Need More Help?**

The most common fix is Step 1 (IP Whitelist). Make sure you:
1. Add `0.0.0.0/0` to Network Access in MongoDB Atlas
2. Wait 1-2 minutes
3. Try again

This solves 90% of connection issues!
