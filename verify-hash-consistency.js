require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');

async function verifyHashConsistency() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME
    });
    console.log('✅ Connected to MongoDB');

    // Find all users and show their current hashes
    const users = await User.find({}).select('email password createdAt updatedAt');
    
    console.log('\n📊 Current users and their password hashes:');
    users.forEach((user, index) => {
      console.log(`\n${index + 1}. Email: ${user.email}`);
      console.log(`   Hash: ${user.password}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log(`   Hash changed since creation: ${user.createdAt.getTime() !== user.updatedAt.getTime() ? '⚠️  YES' : '✅ NO'}`);
    });

    // Test bcrypt consistency
    console.log('\n🔧 Testing bcrypt consistency:');
    const testPassword = 'TestPassword!';
    
    // Create multiple hashes of the same password
    const hash1 = await bcrypt.hash(testPassword, 10);
    const hash2 = await bcrypt.hash(testPassword, 10);
    const hash3 = await bcrypt.hash(testPassword, 10);
    
    console.log('\nSame password, different hashes (this is NORMAL):');
    console.log('Hash 1:', hash1);
    console.log('Hash 2:', hash2);
    console.log('Hash 3:', hash3);
    
    // Test that all hashes work with the same password
    const test1 = await bcrypt.compare(testPassword, hash1);
    const test2 = await bcrypt.compare(testPassword, hash2);
    const test3 = await bcrypt.compare(testPassword, hash3);
    
    console.log('\nAll hashes should work with the same password:');
    console.log('Hash 1 works:', test1 ? '✅' : '❌');
    console.log('Hash 2 works:', test2 ? '✅' : '❌');
    console.log('Hash 3 works:', test3 ? '✅' : '❌');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

verifyHashConsistency();
