import { DoctorProfile } from '../models/DoctorProfile.js';


export const upsertProfile = async (req, res) => {
const { specialties, biography, availability } = req.body;
const profile = await DoctorProfile.findOneAndUpdate(
{ user: req.user._id },
{ specialties, biography, availability },
{ new: true, upsert: true }
);
res.json(profile);
};


export const getProfile = async (req, res) => {
const profile = await DoctorProfile.findOne({ user: req.params.userId }).lean();
res.json(profile);
};