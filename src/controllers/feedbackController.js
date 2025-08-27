import { Feedback } from '../models/Feedback.js';


export const submit = async (req, res) => {
const { appointment, doctor, rating, comment } = req.body;
const fb = await Feedback.create({ appointment, doctor, patient: req.user._id, rating, comment });
res.status(201).json(fb);
};


export const listByDoctor = async (req, res) => {
const items = await Feedback.find({ doctor: req.params.doctorId }).sort('-createdAt').lean();
res.json(items);
};