import { Router } from 'express';
import auth from './auth.js';
import appointments from './appointments.js';
import doctors from './doctors.js';
import admin from './admin.js';
import files from './files.js';
import feedback from './feedback.js';
import articles from './articles.js';
import recommendations from './recommendations.js';

const r = Router();

r.use('/auth', auth);
r.use('/appointments', appointments);
r.use('/doctors', doctors);
r.use('/admin', admin);
r.use('/files', files);
r.use('/feedback', feedback);
r.use('/articles', articles);
r.use('/recommendations', recommendations);

export default r;
