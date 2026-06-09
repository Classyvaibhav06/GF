import OpenAI from 'openai';
import logger from '../utils/logger.js';

let openRouterClient;
let nvidiaClient;

const getOpenRouterClient = () => {
  if (!openRouterClient) {
    if (!process.env.OPENROUTER_API_KEY) throw new Error("OpenRouter API key is missing");
    openRouterClient = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: process.env.OPENROUTER_API_KEY,
      defaultHeaders: {
        'HTTP-Referer': 'http://localhost:5000',
        'X-Title': 'AI Companion App',
      }
    });
  }
  return openRouterClient;
};

let groqClient;
const getGroqClient = () => {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured in .env");
    groqClient = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });
  }
  return groqClient;
};

const getNvidiaClient = () => {
  if (!nvidiaClient) {
    const apiKey = process.env.NVIDIA_API_KEY || "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";
    nvidiaClient = new OpenAI({
      baseURL: 'https://integrate.api.nvidia.com/v1',
      apiKey: apiKey,
    });
  }
  return nvidiaClient;
};

export const generateResponse = async (systemInstruction, messages) => {
  try {
    const client = getGroqClient();

    // Format messages for Groq
    const formattedMessages = [
      { role: 'system', content: systemInstruction },
      ...messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    ];

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: formattedMessages,
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 150, // Keep responses shorter for faster TTS
      stream: false
    });

    const content = response.choices[0].message.content;

    return content;
  } catch (error) {
    logger.error(`AI Service Error: ${error.message}`);
    throw new Error(`Groq API Error: ${error.message}`);
  }
};

export const generateEmbedding = async (text) => {
  try {
    const client = getOpenRouterClient();

    // OpenRouter passes through embedding requests. If it fails, fallback to OpenAI directly in production.
    const response = await client.embeddings.create({
      model: 'text-embedding-3-small', // Ensure OpenRouter supports this, or fallback
      input: text,
      encoding_format: "float",
    });

    return response.data[0].embedding;
  } catch (error) {
    logger.error(`Embedding Generation Error: ${error.message}`);
    // Return a dummy zero vector if embeddings fail in dev environment so it doesn't crash
    return new Array(1536).fill(0);
  }
};

export const transcribeAudio = async (base64Audio) => {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error("GROQ_API_KEY is not configured in .env");
    
    const client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: apiKey,
    });
    
    const audioBuffer = Buffer.from(base64Audio, 'base64');
    
    // dynamically import toFile from openai
    const { toFile } = await import('openai');
    const file = await toFile(audioBuffer, 'audio.webm', { type: 'audio/webm' });

    const response = await client.audio.transcriptions.create({
      file: file,
      model: 'whisper-large-v3',
      language: 'en',
      temperature: 0,
      prompt: "User speaking to AI companion:",
    });

    let text = response.text.trim();
    if (text.toLowerCase() === "user speaking to ai companion:" || text.toLowerCase() === "you") {
      text = "";
    }

    return text;
  } catch (error) {
    // Log the error and throw
    logger.error(`STT Error: ${error.message}`);
    throw new Error('Failed to transcribe audio');
  }
};

export const generateSpeech = async (text) => {
  try {
    const cleanText = text.replace(/[*_~`]/g, '');
    
    // Google TTS max length is 200 chars. Chunk by words to fit under 150 chars.
    const words = cleanText.split(' ');
    const chunks = [];
    let currentChunk = '';
    
    for (const word of words) {
      if ((currentChunk + ' ' + word).length > 150) {
        chunks.push(currentChunk);
        currentChunk = word;
      } else {
        currentChunk = currentChunk ? currentChunk + ' ' + word : word;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    const audioBuffers = [];
    
    // Fetch audio for each chunk using Google's free Translate TTS API
    for (const chunk of chunks) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en-US&client=tw-ob&q=${encodeURIComponent(chunk)}`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Google TTS Error: ${response.status} - ${errText}`);
      }
      
      audioBuffers.push(Buffer.from(await response.arrayBuffer()));
    }

    // Concatenate all mp3 buffers together seamlessly
    return Buffer.concat(audioBuffers);
  } catch (error) {
    throw error;
  }
};
