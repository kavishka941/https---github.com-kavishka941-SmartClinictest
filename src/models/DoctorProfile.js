import mongoose from 'mongoose';


const AvailabilitySlotSchema = new mongoose.Schema({
dayOfWeek: { type: Number, min: 0, max: 6 }, // 0=Sun
start: String, // "09:00"
end: String, // "17:00"
});


const DoctorProfileSchema = new mongoose.Schema(
{
user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
specialties: [{ type: String }],
biography: String,
averageConsultationMinutes: { type: Number, default: 15 },
availability: [AvailabilitySlotSchema],
},
{ timestamps: true }
);


export const DoctorProfile = mongoose.model('DoctorProfile', DoctorProfileSchema);