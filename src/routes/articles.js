import { Router } from 'express';
import { auth, requireRole } from '../middleware/auth.js';
import { createArticle, listArticles } from '../controllers/articleController.js';


const r = Router();


r.get('/', listArticles);


r.post('/', auth, requireRole('doctor'), createArticle);


export default r;