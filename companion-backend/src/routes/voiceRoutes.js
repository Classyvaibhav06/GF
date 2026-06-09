import express from 'express';
import multer from 'multer';
import { processVoiceMessage } from '../controllers/voiceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { premiumOnly } from '../middleware/premiumMiddleware.js';

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

// Route is protected and requires premium plan
router.post('/', protect, premiumOnly, upload.single('audio'), processVoiceMessage);

export default router;
