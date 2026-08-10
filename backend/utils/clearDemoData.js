import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

// Models
import { User, PlacementManager, Admin } from '../models/User.js';
import { Department, Course, Batch } from '../models/Academic.js';
import { Job, Drive, DriveRound } from '../models/JobDrive.js';
import { Application, RoundResult, Interview, Placement, Offer } from '../models/Recruitment.js';
import { Notification, Message, AuditLog } from '../models/System.js';

dotenv.config();

const clearDemoData = async () => {
  try {
    await connectDB();

    console.log('Wiping all mock/demo placement details from database...');
    
    // Wipe all transactional and mock data
    await User.deleteMany();
    await Job.deleteMany();
    await Drive.deleteMany();
    await DriveRound.deleteMany();
    await Application.deleteMany();
    await RoundResult.deleteMany();
    await Interview.deleteMany();
    await Placement.deleteMany();
    await Offer.deleteMany();
    await Notification.deleteMany();
    await Message.deleteMany();
    await AuditLog.deleteMany();
    await Department.deleteMany();
    await Course.deleteMany();
    await Batch.deleteMany();

    console.log('Re-initializing system academic settings...');
    // Seed standard departments
    await Department.insertMany([
      { name: 'Computer Science and Engineering', code: 'CSE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Electronics and Communication Engineering', code: 'ECE' }
    ]);

    // Seed standard courses
    await Course.insertMany([
      { name: 'Bachelor of Technology', code: 'B.Tech', durationYears: 4 },
      { name: 'Master of Computer Applications', code: 'MCA', durationYears: 2 }
    ]);

    // Seed current active batches
    await Batch.insertMany([
      { name: '2022-2026', startYear: 2022, endYear: 2026, isActive: true },
      { name: '2023-2027', startYear: 2023, endYear: 2027, isActive: true }
    ]);

    console.log('Creating standard system operator accounts...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Vamsi@1912', salt);
    const managerHash = await bcrypt.hash('Manager@123', salt);

    // Recreate Admin User
    const adminUser = await User.create({
      email: 'vamsivalluri52@gmail.com',
      password: passwordHash,
      role: 'ADMIN',
      isVerified: true
    });
    await Admin.create({
      user: adminUser._id,
      name: 'Vamsi Valluri',
      phone: '6301231575',
      address: 'Kandipadu, Guntur (Dt), Andhra Pradesh'
    });

    // Recreate Placement Manager User
    const managerUser = await User.create({
      email: 'manager@placetrack.com',
      password: managerHash,
      role: 'PLACEMENT_MANAGER',
      isVerified: true
    });
    await PlacementManager.create({
      user: managerUser._id,
      name: 'College Placement Officer',
      employeeId: 'PM-001',
      department: 'Corporate Relations'
    });

    console.log('Database successfully cleared of demo data and re-seeded with administrator accounts.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to clear database:', error);
    process.exit(1);
  }
};

clearDemoData();
//
