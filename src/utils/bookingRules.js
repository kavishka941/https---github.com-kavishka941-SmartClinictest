import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { Appointment } from '../models/Appointment.js';
import { Branch } from '../models/Branch.js';


dayjs.extend(utc);


export const withinWindow = (start, branch) => {
const rule = branch.rules;
const now = dayjs();
const max = now.add(rule.bookingWindowDays, 'day');
return dayjs(start).isBefore(max);
};


export const overlaps = (aStart, aEnd, bStart, bEnd) => {
return aStart < bEnd && bStart < aEnd;
};


export const isSlotAvailable = async ({ doctorId, start, end }) => {
const conflicts = await Appointment.find({
doctor: doctorId,
status: { $in: ['booked'] },
start: { $lt: end },
end: { $gt: start },
}).lean();
return conflicts.length === 0;
};


export const computeEndTime = (start, branch, doctorProfile) => {
const dur = doctorProfile?.averageConsultationMinutes || branch.rules.slotDurationMinutes;
return dayjs(start).add(dur, 'minute').toDate();
};