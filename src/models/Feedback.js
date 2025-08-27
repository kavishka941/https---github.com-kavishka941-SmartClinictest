import mongoose from 'mongoose';


const FeedbackSchema = new mongoose.Schema(
{
appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
rating: { type: Number, min: 1, max: 5, required: true },
comment: String,
},
{ timestamps: true }
);


export const Feedback = mongoose.model('Feedback', FeedbackSchema);