import { processChatMessage } from '../services/chatService.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// @desc    Send a message and get AI response
// @route   POST /api/chat
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { characterId, message } = req.body;
    
    if (!characterId || !message) {
      return res.status(400).json({ status: 'fail', message: 'characterId and message are required' });
    }

    const aiResponse = await processChatMessage(req.user.id, characterId, message);

    res.status(200).json({
      status: 'success',
      data: {
        response: aiResponse
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat history for a character
// @route   GET /api/chat/:characterId
// @access  Private
export const getChatHistory = async (req, res, next) => {
  try {
    const { characterId } = req.params;
    
    const conversation = await Conversation.findOne({ userId: req.user.id, characterId });
    
    if (!conversation) {
      return res.status(200).json({ status: 'success', data: [] });
    }

    const messages = await Message.find({ conversationId: conversation._id }).sort('timestamp');

    res.status(200).json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Transcribe base64 audio
// @route   POST /api/chat/transcribe
// @access  Private
export const transcribeAudioController = async (req, res, next) => {
  try {
    const { audio } = req.body;
    
    if (!audio) {
      return res.status(400).json({ status: 'fail', message: 'No audio provided' });
    }

    const { transcribeAudio } = await import('../services/aiService.js');
    const transcript = await transcribeAudio(audio);

    res.status(200).json({
      status: 'success',
      transcript
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate TTS audio from text
// @route   POST /api/chat/tts
// @access  Private
export const generateSpeechController = async (req, res, next) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ status: 'fail', message: 'No text provided' });
    }

    const { generateSpeech } = await import('../services/aiService.js');
    const audioBuffer = await generateSpeech(text);

    res.set('Content-Type', 'audio/mpeg');
    res.set('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (error) {
    next(error);
  }
};
