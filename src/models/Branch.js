import mongoose from 'mongoose';


const BookingRulesSchema = new mongoose.Schema({
slotDurationMinutes: { type: Number, default: 15 },
bookingWindowDays: { type: Number, default: 30 },
maxDailyAppointmentsPerDoctor: { type: Number, default: 48 },
allowOverbooking: { type: Boolean, default: false },
openingHours: {
mon: { start: String, end: String, closed: { type: Boolean, default: false } },
tue: { start: String, end: String, closed: { type: Boolean, default: false } },
wed: { start: String, end: String, closed: { type: Boolean, default: false } },
thu: { start: String, end: String, closed: { type: Boolean, default: false } },
fri: { start: String, end: String, closed: { type: Boolean, default: false } },
sat: { start: String, end: String, closed: { type: Boolean, default: false } },
sun: { start: String, end: String, closed: { type: Boolean, default: true } },
},
});


const BranchSchema = new mongoose.Schema(
{
name: { type: String, required: true },
address: { type: String },
phone: { type: String },
timezone: { type: String, default: 'Asia/Colombo' },
rules: { type: BookingRulesSchema, default: () => ({}) },
},
{ timestamps: true }
);


export const Branch = mongoose.model('Branch', BranchSchema);