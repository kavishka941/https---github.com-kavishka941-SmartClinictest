import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { uploadPrescription, listPrescriptions, streamPrescription } from '../controllers/fileController.js';


const r = Router();


r.get('/', auth, listPrescriptions);


r.post('/prescriptions', auth, upload.single('file'), uploadPrescription);


r.get('/prescriptions/:id', auth, streamPrescription);


export default r;