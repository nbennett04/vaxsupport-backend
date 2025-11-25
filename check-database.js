require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME
    });
    console.log('✅ Connected to MongoDB');

    // Check if our test user exists
    const testUser = await User.findOne({ email: 'testuser@example.com' });
    
    if (testUser) {
      console.log('✅ Test user found in database:');
      console.log('📧 Email:', testUser.email);
      console.log('👤 Name:', testUser.firstName, testUser.lastName);
      console.log('📱 Phone:', testUser.phone);
      console.log('🌍 Location:', testUser.state, testUser.country);
      console.log('📅 Created:', testUser.createdAt);
      console.log('🔑 Password Hash:', testUser.password ? 'EXISTS' : 'MISSING');
      console.log('🆔 User ID:', testUser._id);
    } else {
      console.log('❌ Test user not found in database');
    }

    // Show total users in database
    const totalUsers = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${totalUsers}`);

    // Show all users (first 5, without passwords)
    const allUsers = await User.find({}).select('email firstName lastName createdAt').limit(5);
    console.log('\n👥 Recent users in database:');
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} - ${user.firstName} ${user.lastName} (${user.createdAt})`);
    });

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

checkDatabase();
