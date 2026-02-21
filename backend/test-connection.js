require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...');
console.log('Connection String:', process.env.MONGODB_URI.replace(/:[^:@]+@/, ':****@'));

const testConnection = async () => {
    try {
        console.log('\n⏳ Attempting to connect...');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        
        console.log('\n✅ SUCCESS! MongoDB Connected');
        console.log('Host:', conn.connection.host);
        console.log('Database:', conn.connection.name);
        console.log('Port:', conn.connection.port);
        
        // Test a simple operation
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('\n📦 Collections:', collections.length);
        
        await mongoose.connection.close();
        console.log('\n✅ Connection test completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ CONNECTION FAILED');
        console.error('Error:', error.message);
        console.error('\n🔧 Troubleshooting Steps:');
        console.error('1. Check your internet connection');
        console.error('2. Verify MongoDB Atlas IP Whitelist:');
        console.error('   - Go to Network Access in MongoDB Atlas');
        console.error('   - Add IP Address: 0.0.0.0/0 (Allow from anywhere)');
        console.error('3. Verify your credentials are correct');
        console.error('4. Check if your network/firewall blocks MongoDB ports');
        console.error('5. Try using a VPN if behind corporate firewall');
        process.exit(1);
    }
};

testConnection();
