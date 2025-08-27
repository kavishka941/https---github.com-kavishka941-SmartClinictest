import dayjs from 'dayjs';
import { Appointment } from '../models/Appointment.js';


export const summary = async (req, res) => {
const from = req.query.from ? new Date(req.query.from) : dayjs().subtract(30, 'day').toDate();
const to = req.query.to ? new Date(req.query.to) : new Date();


const [byStatus, byBranch, utilization] = await Promise.all([
Appointment.aggregate([
{ $match: { start: { $gte: from, $lte: to } } },
{ $group: { _id: '$status', count: { $sum: 1 } } },
]),
Appointment.aggregate([
{ $match: { start: { $gte: from, $lte: to } } },
{ $group: { _id: '$branch', count: { $sum: 1 } } },
]),
Appointment.aggregate([
{ $match: { start: { $gte: from, $lte: to }, status: 'booked' } },
{ $group: { _id: '$doctor', count: { $sum: 1 } } },
]),
]);


res.json({ byStatus, byBranch, utilization });
};