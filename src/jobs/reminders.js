import dayjs from 'dayjs';
import { agenda } from '../config/agenda.js';
import { Appointment } from '../models/Appointment.js';
import { User } from '../models/User.js';
import { notifyEmail, notifySMS } from '../utils/notifications.js';


agenda.define('send-appointment-reminder', async (job) => {
const { appointmentId, when } = job.attrs.data;
const appt = await Appointment.findById(appointmentId).lean();
if (!appt || appt.status !== 'booked') return;
const patient = await User.findById(appt.patient).lean();
const doctor = await User.findById(appt.doctor).lean();
const startStr = dayjs(appt.start).format('YYYY-MM-DD HH:mm');
await notifyEmail({
to: patient.email,
subject: `Reminder: appointment ${when} (${startStr})`,
html: `<p>Hi ${patient.name}, this is a ${when} reminder for your appointment with Dr. ${doctor.name} on ${startStr}.</p>`,
});
await notifySMS({ to: patient.phone, body: `Reminder: appt with Dr.${doctor.name} on ${startStr}` });
});


export const scheduleReminders = async (appointment) => {
const start = dayjs(appointment.start);
const minus24h = start.subtract(24, 'hour').toDate();
const minus2h = start.subtract(2, 'hour').toDate();
await agenda.schedule(minus24h, 'send-appointment-reminder', { appointmentId: appointment._id, when: '24h' });
await agenda.schedule(minus2h, 'send-appointment-reminder', { appointmentId: appointment._id, when: '2h' });
};