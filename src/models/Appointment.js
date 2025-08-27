import mongoose from 'mongoose';


const AppointmentSchema = new mongoose.Schema(
{
branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
start: { type: Date, required: true },
end: { type: Date, required: true },
status: { type: String, enum: ['booked', 'cancelled', 'completed', 'no-show'], default: 'booked' },
channel: { type: String, enum: ['online', 'phone', 'walk-in'], default: 'online' },
createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // staff who booked phone/walk-in
notes: String,
},
{ timestamps: true }
);


AppointmentSchema.index({ doctor: 1, start: 1, end: 1 });


export const Appointment = mongoose.model('Appointment', AppointmentSchema);