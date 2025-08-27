import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { submit, listByDoctor } from '../controllers/feedbackController.js';


const r = Router();


r.post('/', auth, requireRole('patient'), submit);


r.get('/doctor/:doctorId', auth, listByDoctor);


export default r;