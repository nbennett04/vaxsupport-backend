require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function testSpecificPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME
    });
    console.log('✅ Connected to MongoDB');

    // Find the specific user
    const testUser = await User.findOne({ email: 'testuser@example.com' }).select('+password');
    
    if (!testUser) {
      console.log('❌ User testuser@example.com not found');
      return;
    }

    console.log('✅ User found:', testUser.email);
    console.log('🔑 Stored hash:', testUser.password);

    // Test the specific password you're trying to use
    const passwordToTest = 'TestPassword123!';
    console.log('🔍 Testing password:', passwordToTest);

    const isMatch = await bcrypt.compare(passwordToTest, testUser.password);
    console.log('🔍 Password match result:', isMatch ? '✅ MATCH' : '❌ NO MATCH');

    if (!isMatch) {
      console.log('\n🔧 Let me try some variations:');
      const variations = [
        'TestPassword!',
        'TestPassword123',
        'testpassword123!',
        'TestPassword123!',
        'password123',
        'test123'
      ];

      for (const variation of variations) {
        const testResult = await bcrypt.compare(variation, testUser.password);
        console.log(`Password "${variation}": ${testResult ? '✅ MATCH' : '❌ NO MATCH'}`);
      }

      console.log('\n💡 If none of these work, we need to reset the password.');
      console.log('   The user might have been created with a different password.');
    } else {
      console.log('\n🎉 Password matches! The login should work.');
      console.log('   If it\'s still not working, the issue is elsewhere (session, middleware, etc.)');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

testSpecificPassword();
