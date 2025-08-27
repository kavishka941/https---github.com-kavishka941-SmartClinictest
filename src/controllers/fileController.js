import fs from 'fs';
import path from 'path';
import { Prescription } from '../models/Prescription.js';


export const uploadPrescription = async (req, res) => {
const { appointmentId, patientId, doctorId } = req.body;
const file = req.file;
if (!file) return res.status(400).json({ message: 'No file uploaded' });


const meta = await Prescription.create({
appointment: appointmentId,
uploader: req.user._id,
patient: patientId,
doctor: doctorId,
filename: file.filename,
originalName: file.originalname,
mimeType: file.mimetype,
size: file.size,
storageKey: file.path,
});
res.status(201).json(meta);
};


export const listPrescriptions = async (req, res) => {
const { appointmentId } = req.query;
const q = { };
if (appointmentId) q.appointment = appointmentId;
// limit visibility: patient, doctor, admin
if (req.user.role === 'patient') q.patient = req.user._id;
if (req.user.role === 'doctor') q.doctor = req.user._id;
const files = await Prescription.find(q).lean();
res.json(files);
};


export const streamPrescription = async (req, res) => {
const file = await Prescription.findById(req.params.id).lean();
if (!file) return res.status(404).json({ message: 'Not found' });
const canView =
req.user.role === 'admin' ||
String(file.patient) === String(req.user._id) ||
String(file.doctor) === String(req.user._id);
if (!canView) return res.status(403).json({ message: 'Forbidden' });
const p = path.resolve(file.storageKey);
if (!fs.existsSync(p)) return res.status(410).json({ message: 'File missing' });
res.setHeader('Content-Type', file.mimeType);
fs.createReadStream(p).pipe(res);
};