import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { summary } from '../controllers/adminController.js';


const r = Router();


r.get('/summary', auth, requireRole('admin'), summary);


export default r;