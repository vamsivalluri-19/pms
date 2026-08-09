import mongoose from 'mongoose';

// Department Schema
const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true }
}, { timestamps: true });

// Course Schema
const courseSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true, unique: true },
  durationYears: { type: Number, required: true }
}, { timestamps: true });

// Batch Schema
const batchSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. 2022-2026
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Department = mongoose.model('Department', departmentSchema);
export const Course = mongoose.model('Course', courseSchema);
export const Batch = mongoose.model('Batch', batchSchema);
