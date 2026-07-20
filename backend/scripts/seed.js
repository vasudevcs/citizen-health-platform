require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const HealthVital = require('../models/HealthVital');
const Medication = require('../models/Medication');
const Appointment = require('../models/Appointment');
const LabReport = require('../models/LabReport');
const Notification = require('../models/Notification');

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_health';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected');

    const email = 'citizen@test.com';
    const userObj = await User.findOne({ email });
    if (!userObj) {
      console.error(`User with email ${email} not found. Please register or create user first.`);
      process.exit(1);
    }
    const citizen = userObj._id;
    console.log(`Found user: ${userObj.name} (${citizen})`);

    // Clean existing data for this user to avoid duplicates
    console.log('Cleaning existing user data...');
    await HealthVital.deleteMany({ citizen });
    await Medication.deleteMany({ citizen });
    await Appointment.deleteMany({ citizen });
    await LabReport.deleteMany({ citizen });
    await Notification.deleteMany({ user: citizen });

    const now = new Date();

    // 1. Seed Vitals (Historical trends for Recharts)
    console.log('Seeding Vitals history (30 days)...');
    const vitalsData = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);

      // Blood Pressure (Target: ~120/80 with some fluctuation)
      vitalsData.push({
        citizen,
        type: 'blood_pressure',
        value: {
          primary: Math.round(115 + Math.random() * 15), // Systolic
          secondary: Math.round(75 + Math.random() * 10), // Diastolic
        },
        unit: 'mmHg',
        recordedAt: date,
        notes: i === 0 ? 'Logged after morning walk' : undefined,
      });

      // Blood Sugar (Target: ~90-110 mg/dL fasting/random fluctuation)
      vitalsData.push({
        citizen,
        type: 'blood_sugar',
        value: {
          primary: Math.round(85 + Math.random() * 30),
        },
        unit: 'mg/dL',
        recordedAt: date,
      });

      // Heart Rate (Target: ~65-85 bpm)
      vitalsData.push({
        citizen,
        type: 'heart_rate',
        value: {
          primary: Math.round(65 + Math.random() * 20),
        },
        unit: 'bpm',
        recordedAt: date,
      });

      // Weight (Slowly decreasing trend to simulate progress)
      vitalsData.push({
        citizen,
        type: 'weight',
        value: {
          primary: Number((78.5 - (29 - i) * 0.05 + Math.random() * 0.2).toFixed(1)),
        },
        unit: 'kg',
        recordedAt: date,
      });
    }

    // Latest single readings for dashboard widgets (BMI, SpO2, Sleep, Activity)
    vitalsData.push(
      {
        citizen,
        type: 'bmi',
        value: { primary: 24.2 },
        unit: 'kg/m²',
        recordedAt: now,
      },
      {
        citizen,
        type: 'oxygen_saturation',
        value: { primary: 98 },
        unit: '%',
        recordedAt: now,
      },
      {
        citizen,
        type: 'sleep',
        value: { primary: 7.5 },
        unit: 'hrs',
        recordedAt: now,
      },
      {
        citizen,
        type: 'activity',
        value: { primary: 8420 },
        unit: 'steps',
        recordedAt: now,
      }
    );

    await HealthVital.insertMany(vitalsData);

    // 2. Seed Medications
    console.log('Seeding Medications...');
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    await Medication.insertMany([
      {
        citizen,
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        times: ['08:00', '20:00'],
        startDate: yesterday,
        instructions: 'Take with meals',
        isActive: true,
        prescribedBy: 'Dr. Ramesh Kumar',
        takenDates: [yesterday], // Taken yesterday, but not today (shows as pending)
      },
      {
        citizen,
        name: 'Atorvastatin',
        dosage: '10mg',
        frequency: 'Once daily',
        times: ['21:00'],
        startDate: yesterday,
        instructions: 'Take before bedtime',
        isActive: true,
        prescribedBy: 'Dr. Ramesh Kumar',
        takenDates: [yesterday, now], // Taken yesterday AND today (shows as taken)
      }
    ]);

    // 3. Seed Appointments
    console.log('Seeding Appointments...');
    const apptDate = new Date(now);
    apptDate.setDate(now.getDate() + 2); // 2 days from now
    apptDate.setHours(10, 30, 0, 0);

    await Appointment.insertMany([
      {
        citizen,
        doctorName: 'Dr. Ramesh Kumar',
        doctorSpecialty: 'Cardiologist',
        scheduledAt: apptDate,
        durationMinutes: 20,
        status: 'confirmed',
        type: 'telemedicine',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
      }
    ]);

    // 4. Seed Lab Reports
    console.log('Seeding Lab Reports...');
    const reportDate = new Date(now);
    reportDate.setDate(now.getDate() - 5);

    await LabReport.insertMany([
      {
        citizen,
        title: 'Routine Blood Panel',
        lab: 'Apollo Diagnostics',
        conductedAt: reportDate,
        notes: 'Slightly elevated LDL cholesterol, but overall good metrics.',
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        results: [
          {
            parameter: 'Fasting Blood Sugar',
            value: 95,
            unit: 'mg/dL',
            referenceRange: '70 - 100',
            status: 'normal',
          },
          {
            parameter: 'Total Cholesterol',
            value: 210,
            unit: 'mg/dL',
            referenceRange: '< 200',
            status: 'high',
          },
          {
            parameter: 'Hemoglobin',
            value: 14.5,
            unit: 'g/dL',
            referenceRange: '13.5 - 17.5',
            status: 'normal',
          }
        ]
      }
    ]);

    // 5. Seed Notifications
    console.log('Seeding Notifications...');
    await Notification.insertMany([
      {
        user: citizen,
        title: 'Upcoming Appointment',
        message: 'You have a telemedicine consultation with Dr. Ramesh Kumar in 2 days.',
        type: 'appointment',
        isRead: false,
      },
      {
        user: citizen,
        title: 'Medication Reminder',
        message: 'Time to take Metformin (500mg).',
        type: 'medication',
        isRead: false,
      },
      {
        user: citizen,
        title: 'Lab Report Available',
        message: 'Your Routine Blood Panel results from Apollo Diagnostics are now ready.',
        type: 'lab_report',
        isRead: true,
      }
    ]);

    console.log('Successfully seeded all simulated data!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    mongoose.connection.close();
  }
}

seed();
