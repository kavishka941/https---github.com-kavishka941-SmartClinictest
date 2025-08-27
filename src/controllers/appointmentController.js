// controllers/appointmentController.js
import dayjs from 'dayjs';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';

import { Appointment } from '../models/Appointment.js';
import {Branch} from '../models/Branch.js';
import {DoctorProfile} from '../models/DoctorProfile.js';
import { notifyEmail, notifySMS } from '../utils/notifications.js';
import { scheduleReminders } from '../jobs/reminders.js';
import { withinWindow, computeEndTime, isSlotAvailable } from '../utils/bookingRules.js';

// GET /appointments
export const list = async (req, res) => {
  try {
    const { doctor, patient, branch, from, to } = req.query;

    const q = {};
    if (doctor) q.doctor = doctor;
    if (patient) q.patient = patient;
    if (branch) q.branch = branch;
    if (from || to) q.start = {};
    if (from) q.start.$gte = new Date(from);
    if (to) q.start.$lte = new Date(to);

    const appts = await Appointment.find(q)
      .populate({ path: 'doctor', select: 'name email' })
      .populate({ path: 'patient', select: 'name email' })
      .populate({ path: 'branch', select: 'name' });

    return res.json(appts);
  } catch (err) {
    console.error('List error:', err);
    return res.status(500).json({ message: 'Failed to fetch appointments' });
  }
};

// POST /appointments
export const create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { branchId, doctorId, patientId, start, channel, notes, patientEmail, patientPhone } = req.body;

    const branch = await Branch.findById(branchId);
    const doctorProfile = await DoctorProfile.findOne({ user: doctorId });
    if (!branch || !doctorProfile) return res.status(400).json({ message: 'Invalid branch or doctor' });

    const startDate = new Date(start);
    if (!withinWindow(startDate, branch)) return res.status(400).json({ message: 'Outside booking window' });

    const endDate = computeEndTime(startDate, branch, doctorProfile);

    const available = await isSlotAvailable({ doctorId, start: startDate, end: endDate });
    if (!available && !branch.rules?.allowOverbooking) {
      return res.status(409).json({ message: 'Slot not available' });
    }

    const appt = await Appointment.create({
      branch: branchId,
      doctor: doctorId,
      patient: patientId,
      start: startDate,
      end: endDate,
      channel: channel || 'online',
      createdBy: req.user?._id,
      notes,
      status: 'booked',
    });

    await notifyEmail({
      to: patientEmail,
      subject: 'Appointment booked',
      html: `<p>Your appointment is confirmed for ${dayjs(appt.start).format('YYYY-MM-DD HH:mm')}.</p>`,
    }).catch(() => {});
    await notifySMS({ to: patientPhone, body: 'Your appointment has been booked.' }).catch(() => {});
    await scheduleReminders(appt);

    return res.status(201).json(appt);
  } catch (err) {
    console.error('Create error:', err);
    return res.status(500).json({ message: 'Failed to create appointment' });
  }
};

// PATCH /appointments/:id/cancel
export const cancel = async (req, res) => {
  try {
    const { id } = req.params;
    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Not found' });
    appt.status = 'cancelled';
    await appt.save();
    return res.json({ message: 'Cancelled', appointment: appt });
  } catch (err) {
    console.error('Cancel error:', err);
    return res.status(500).json({ message: 'Failed to cancel appointment' });
  }
};

// PATCH /appointments/:id/reschedule
export const reschedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { newStart } = req.body;

    const appt = await Appointment.findById(id);
    if (!appt) return res.status(404).json({ message: 'Not found' });

    const branch = await Branch.findById(appt.branch);
    const doctorProfile = await DoctorProfile.findOne({ user: appt.doctor });

    const startDate = new Date(newStart);
    const endDate = computeEndTime(startDate, branch, doctorProfile);

    const available = await isSlotAvailable({ doctorId: appt.doctor, start: startDate, end: endDate });
    if (!available && !branch.rules?.allowOverbooking) {
      return res.status(409).json({ message: 'Slot not available' });
    }

    appt.start = startDate;
    appt.end = endDate;
    await appt.save();

    return res.json({ message: 'Rescheduled', appointment: appt });
  } catch (err) {
    console.error('Reschedule error:', err);
    return res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
};
