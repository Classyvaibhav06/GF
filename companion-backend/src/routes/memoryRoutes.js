import express from 'express';
import { getMemories, updateMemory, deleteMemory } from '../controllers/memoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:characterId', protect, getMemories);

router.route('/:id')
  .put(protect, updateMemory)
  .delete(protect, deleteMemory);

export default router;
