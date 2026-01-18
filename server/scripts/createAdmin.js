require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');

async function createAdmin() {
  try {
    console.log('\n🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('✅ Connected to database\n');

    // Admin details
    const adminEmail = 'admin@studynotion.com';
    const adminPassword = 'Admin@123';  // ⚠️ Change this after first login!

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('⚠️  Admin already exists with email:', adminEmail);
      console.log('💡 Use the login page to access the admin account');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('📝 Creating admin profile...');
    // Create profile
    const profile = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: 'Platform Administrator',
      contactNumber: null,
    });
    console.log('✅ Profile created');

    console.log('🔐 Hashing password...');
    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('✅ Password hashed');

    console.log('👤 Creating admin user...');
    // Create admin user
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: hashedPassword,
      accountType: 'Admin',
      active: true,
      approved: true,
      additionalDetails: profile._id,
      courses: [],
      courseProgress: [],
      credits: 0,
    });

    console.log('\n' + '═'.repeat(60));
    console.log('🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    console.log('\n📧 Email:    ', admin.email);
    console.log('🔑 Password: ', adminPassword);
    console.log('\n⚠️  IMPORTANT: Change this password after first login!');
    console.log('\n🌐 Login URL: http://localhost:3000/login');
    console.log('   (or your deployed frontend URL)');
    console.log('\n' + '═'.repeat(60) + '\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
    if (error.code === 11000) {
      console.log('💡 This email is already registered');
    }
    await mongoose.disconnect();
    process.exit(1);
  }
}

console.log('\n🚀 StudyNotion Admin Creation Script');
console.log('════════════════════════════════════\n');
createAdmin();
