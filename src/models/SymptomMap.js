import mongoose from 'mongoose';


const SymptomMapSchema = new mongoose.Schema(
{
symptom: { type: String, required: true, unique: true },
specialties: [{ type: String, required: true }],
},
{ timestamps: true }
);


export const SymptomMap = mongoose.model('SymptomMap', SymptomMapSchema);