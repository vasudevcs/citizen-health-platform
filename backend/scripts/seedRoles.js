require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

// Creates one ready-to-login user per role. Unlike registering through the
// API, this skips OTP/email verification entirely (isVerified: true is set
// directly), so these accounts work immediately for local testing.
//
// Run from backend/: node scripts/seedRoles.js
const PASSWORD = 'Password123!';

const USERS = [
  {
    name: 'Test Citizen',
    username: 'citizen',
    email: 'citizen@test.com',
    phone: '+10000000001',
    role: 'citizen'
  },
  {
    name: 'Dr. Test Doctor',
    username: 'doctor',
    email: 'doctor@test.com',
    phone: '+10000000002',
    role: 'doctor'
  },
  {
    name: 'Test Ambassador',
    username: 'ambassador',
    email: 'ambassador@test.com',
    phone: '+10000000003',
    role: 'ambassador'
  },
  {
    name: 'Test Researcher',
    username: 'researcher',
    email: 'researcher@test.com',
    phone: '+10000000004',
    role: 'researcher'
  },
  {
    name: 'Test Admin',
    username: 'admin',
    email: 'admin@test.com',
    phone: '+10000000005',
    role: 'admin'
  },
];

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_health';
  console.log(`Connecting to MongoDB at: ${mongoUri}`);
  await mongoose.connect(mongoUri);
  console.log('MongoDB Connected\n');

  for (const u of USERS) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      // Keep it idempotent — re-running the script just resets the
      // password/verification/active flags instead of erroring on
      // the unique email/phone index.
      existing.passwordHash = PASSWORD; // re-hashed by the pre-save hook
      existing.isVerified = true;
      existing.isActive = true;
      existing.failedLoginAttempts = 0;
      existing.lockUntil = undefined;
      await existing.save();
      console.log(`Reset:  ${u.role.padEnd(11)} ${u.email}`);
      continue;
    }

    const user = new User({
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      passwordHash: PASSWORD, // hashed by the pre-save hook
      role: u.role,
      isVerified: true,
      isActive: true,
      ...(u.role === 'doctor' && {
        doctorProfile: {
          specialty: 'General Medicine',
          licenseNumber: 'TEST-LICENSE-001',
          bio: 'Seeded test doctor account.',
          availability: [
            { day: 'mon', startTime: '09:00', endTime: '17:00' },
            { day: 'wed', startTime: '09:00', endTime: '17:00' },
            { day: 'fri', startTime: '09:00', endTime: '13:00' },
          ],
        },
      }),
    });
    await user.save();
    console.log(`Created: ${u.role.padEnd(11)} ${u.email}`);
  }

  console.log(`\nAll accounts use the password: ${PASSWORD}`);
  console.log('Log in at /login with any of the emails above.');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
