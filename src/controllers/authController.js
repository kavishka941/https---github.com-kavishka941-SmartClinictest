import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';

const sign = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

export const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, phone, password, role, branch } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already in use' });

  const user = await User.create({ name, email, phone, password, role, branch });
  res.status(201).json({
    token: sign(user),
    user: { id: user._id, name: user.name, role: user.role },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  res.json({
    token: sign(user),
    user: { id: user._id, name: user.name, role: user.role },
  });
};

export const me = async (req, res) => {
  res.json({ user: req.user });
};
