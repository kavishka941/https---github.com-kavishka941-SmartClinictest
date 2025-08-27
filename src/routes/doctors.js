import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { upsertProfile, getProfile } from '../controllers/doctorController.js';


const r = Router();


r.get('/:userId/profile', auth, getProfile);


r.put('/me/profile', auth, requireRole('doctor'), upsertProfile);


export default r;