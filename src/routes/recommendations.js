import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { recommend } from '../controllers/recommendationController.js';


const r = Router();


r.post('/', auth, recommend);


export default r;