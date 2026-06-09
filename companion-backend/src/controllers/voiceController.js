import { processChatMessage } from '../services/chatService.js';
import fs from 'fs';

// Mock STT / TTS functions since we don't have a real audio AI wired up here yet.
// In production, use Google Cloud Speech-to-Text or OpenAI Whisper.

// @desc    Process voice message
// @route   POST /api/voice
// @access  Private (Premium)
export const processVoiceMessage = async (req, res, next) => {
  try {
    const { characterId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'Audio file is required' });
    }

    // 1. Speech to text (Mock)
    // const text = await speechToText(req.file.path);
    const mockTranscribedText = "Hello, how are you doing today?";

    // 2. Get AI Response text
    const aiResponseText = await processChatMessage(req.user.id, characterId, mockTranscribedText);

    // 3. Text to Speech (Mock)
    // const audioUrl = await textToSpeech(aiResponseText, character.voiceId);
    const mockAudioUrl = "https://example.com/mock-audio-response.mp3";

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      status: 'success',
      data: {
        transcription: mockTranscribedText,
        textResponse: aiResponseText,
        audioUrl: mockAudioUrl
      }
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
