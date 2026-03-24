import express from 'express';
import { registerOffice, registerRealtor, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register/office', registerOffice);
router.post('/register/realtor', registerRealtor);
router.post('/login', login);

export default router;