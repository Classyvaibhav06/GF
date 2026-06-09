import express from 'express';
import { sendMessage, getChatHistory, transcribeAudioController, generateSpeechController } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, sendMessage);
router.post('/transcribe', protect, transcribeAudioController);
router.post('/tts', protect, generateSpeechController);
router.get('/:characterId', protect, getChatHistory);

export default router;
