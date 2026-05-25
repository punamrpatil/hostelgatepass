const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Student = require('./models/Student');
const TG = require('./models/TG');
dotenv.config();
const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-hostel-gatepass');
    console.log('MongoDB Connected for seeding...');
    // Clear old users and specific profiles to avoid duplicates during seeding
    await User.deleteMany({
      email: {
        $in: [
          'admin@college.edu',
          'tg@college.edu',
          'student@college.edu',
          'warden@college.edu',
          'security@college.edu',
          'hod@college.edu'
        ]
      }
    });
    console.log('Cleared seed-related users if they existed...');
    // 1. Create HOD User
    await User.create({
      name: 'Dr. Sarah Smith (CSE HOD)',
      email: 'hod@college.edu',
      password: 'hod123',
      role: 'HOD',
      phone: '9000000001'
    });
    console.log('✔ HOD User Created');
    // 2. Create Security User
    await User.create({
      name: 'Officer John Rambo (Main Gate)',
      email: 'security@college.edu',
      password: 'security123',
      role: 'Security',
      phone: '9000000002'
    });
    console.log('✔ Security User Created');
    // 3. Create Warden User
    await User.create({
      name: 'Mrs. McGonagall (Girls Hostel Warden)',
      email: 'warden@college.edu',
      password: 'warden123',
      role: 'Warden',
      phone: '9000000003'
    });
    console.log('✔ Warden User Created');
    // 4. Create Admin User
    await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'Admin',
      phone: '9000000004'
    });
    console.log('✔ Admin User Created');
    // 5. Create TG User & profile
    const tgUser = await User.create({
      name: 'Prof. vyas sir',
      email: 'vyas@college.edu',
      password: 'tg123',
      role: 'TG',
      phone: '9876543210'
    });
    const tgProfile = await TG.create({
      userId: tgUser._id,
      tgName: 'Prof.vyas',
      branch: 'CSE',
      division: 'A',
      phone: '9876543210'
    });
    console.log('✔ TG User & Profile Created (CSE - Division A)');
    // 6. Create Student User & profile linked to the TG!
    const studentUser = await User.create({
      name: 'Harry Potter',
      email: 'student@college.edu',
      password: 'student123',
      role: 'Student',
      phone: '9012345678'
    });
    await Student.create({
      userId: studentUser._id,
      rollNo: '20CSE45',
      branch: 'CSE',
      division: 'A',
      gender: 'Male',
      studentPhone: '9012345678',
      parentPhone: '9801234567',
      roomNo: 'G-301',
      tgId: tgProfile._id // Mapped automatically
    });
    console.log('✔ Student User & Profile Mapped to TG Created (Harry Potter - 20CSE45)');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};
seedDatabase();
