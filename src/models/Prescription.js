import mongoose from 'mongoose';


const PrescriptionSchema = new mongoose.Schema(
{
appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
uploader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
filename: String,
originalName: String,
mimeType: String,
size: Number,
storageKey: String, // local path or cloud key
},
{ timestamps: true }
);


export const Prescription = mongoose.model('Prescription', PrescriptionSchema);