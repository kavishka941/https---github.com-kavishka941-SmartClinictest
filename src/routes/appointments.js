import { Router } from 'express';
import { body } from 'express-validator';
import { auth, requireRole } from '../middleware/auth.js';
import { list, create, cancel, reschedule } from '../controllers/appointmentController.js';


const r = Router();


r.get('/', auth, list);


r.post(
'/',
auth,
requireRole('admin', 'staff', 'patient'),
[body('branchId').notEmpty(), body('doctorId').notEmpty(), body('patientId').notEmpty(), body('start').notEmpty()],
create
);


r.patch('/:id/cancel', auth, requireRole('admin', 'staff', 'patient'), cancel);


r.patch('/:id/reschedule', auth, requireRole('admin', 'staff', 'patient'), reschedule);


export default r;