import express from 'express';
import { getCharacters, getCharacter, createCharacter } from '../controllers/characterController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getCharacters)
  .post(protect, createCharacter); // Typically protect & authorize('admin')

router.route('/:id')
  .get(getCharacter);

export default router;
