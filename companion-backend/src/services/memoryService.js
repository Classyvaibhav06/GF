import Memory from '../models/Memory.js';
import { generateResponse, generateEmbedding } from './aiService.js';
import { cosineSimilarity } from '../utils/vectorMath.js';
import logger from '../utils/logger.js';

export const extractAndSaveMemory = async (userId, characterId, userMessage) => {
  try {
    const prompt = `
    Analyze the following user message and extract important facts, preferences, or relationship milestones about the user.
    
    CRITICAL: You MUST extract statements of affection, romantic interest, or relationship status (e.g. "I love you", "You are my girlfriend", "I missed you") as high-importance facts! Do not ignore them.
    
    Return the result strictly as a JSON array of objects.
    Each object must have the following keys:
    - "memoryText": The extracted fact (e.g., "User expressed they love me", "User is learning React").
    - "category": Must be one of: "personal", "career", "education", "hobbies", "relationship", "preferences", "goals", "other".
    - "importanceScore": A number from 1 to 10 (1=low, 5=medium, 10=high). Relationship affection should be 8-10.

    If no important facts are found, return an empty array: []

    Message: "${userMessage}"
    `;

    const extractionText = await generateResponse("You are a memory extraction assistant that outputs strict JSON arrays only.", [{ role: 'user', content: prompt }]);
    
    // Attempt to parse JSON. Sometimes LLMs wrap it in markdown code blocks.
    let jsonStr = extractionText.trim();
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/^```json/, '');
    if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/^```/, '');
    if (jsonStr.endsWith('```')) jsonStr = jsonStr.replace(/```$/, '');
    
    const extractedFacts = JSON.parse(jsonStr.trim());

    if (!Array.isArray(extractedFacts) || extractedFacts.length === 0) {
      return;
    }

    for (const fact of extractedFacts) {
      if (!fact.memoryText) continue;

      // Deduplication check: get all memories for this user/character
      const existingMemories = await Memory.find({ userId, characterId });
      
      const newFactEmbedding = await generateEmbedding(fact.memoryText);
      let isDuplicate = false;

      // Check if similar memory exists (cosine similarity > 0.85)
      for (const existing of existingMemories) {
        if (!existing.embedding || existing.embedding.length === 0) continue;
        const sim = cosineSimilarity(newFactEmbedding, existing.embedding);
        if (sim > 0.85) {
          // Update existing instead of duplicating
          existing.memoryText = fact.memoryText;
          existing.category = fact.category || 'other';
          existing.importanceScore = Math.max(existing.importanceScore, fact.importanceScore || 5);
          existing.embedding = newFactEmbedding;
          await existing.save();
          isDuplicate = true;
          logger.info(`Updated existing memory for user ${userId}: ${fact.memoryText}`);
          break;
        }
      }

      if (!isDuplicate) {
        await Memory.create({
          userId,
          characterId,
          memoryText: fact.memoryText,
          category: fact.category || 'other',
          importanceScore: fact.importanceScore || 5,
          embedding: newFactEmbedding
        });
        logger.info(`Extracted new memory for user ${userId}: ${fact.memoryText}`);
      }
    }
  } catch (error) {
    logger.error(`Memory extraction failed: ${error.message}`);
  }
};

export const retrieveMemories = async (userId, characterId, queryMessage) => {
  try {
    const queryEmbedding = await generateEmbedding(queryMessage);
    const allMemories = await Memory.find({ userId, characterId });

    if (!allMemories.length) return [];

    // Score memories by similarity * importance
    const scoredMemories = allMemories.map(mem => {
      let sim = 0;
      if (mem.embedding && mem.embedding.length > 0) {
        sim = cosineSimilarity(queryEmbedding, mem.embedding);
      }
      
      // Memory Decay Logic: Decrease score slightly based on age (10% decay per 30 days)
      const ageInDays = (Date.now() - new Date(mem.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      const decayFactor = Math.max(0.5, 1 - (ageInDays / 300)); 
      
      const finalScore = sim * (mem.importanceScore / 10) * decayFactor;
      return { ...mem.toObject(), similarity: sim, finalScore };
    });

    // Sort by final score descending and pick top 5
    scoredMemories.sort((a, b) => b.finalScore - a.finalScore);
    return scoredMemories.slice(0, 5);
  } catch (error) {
    logger.error(`Memory retrieval failed: ${error.message}`);
    return [];
  }
};
