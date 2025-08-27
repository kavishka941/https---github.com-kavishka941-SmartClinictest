import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';

const r = Router();

r.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'doctor', 'patient', 'staff']),
  ],
  register
);

r.post('/login', login);
r.get('/me', auth, me);

export default r;
