import Character from '../models/Character.js';

// @desc    Get all public characters
// @route   GET /api/characters
// @access  Public
export const getCharacters = async (req, res, next) => {
  try {
    const characters = await Character.find({ isPublic: true });
    res.status(200).json({
      status: 'success',
      count: characters.length,
      data: characters
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single character
// @route   GET /api/characters/:id
// @access  Public
export const getCharacter = async (req, res, next) => {
  try {
    const character = await Character.findById(req.params.id);
    
    if (!character) {
      return res.status(404).json({ status: 'fail', message: 'Character not found' });
    }

    res.status(200).json({
      status: 'success',
      data: character
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new character
// @route   POST /api/characters
// @access  Private/Admin (Assuming protect middleware is used, and potentially admin check)
export const createCharacter = async (req, res, next) => {
  try {
    // Note: In a full app, we would verify req.user.role === 'admin' here.
    const character = await Character.create(req.body);

    res.status(201).json({
      status: 'success',
      data: character
    });
  } catch (error) {
    next(error);
  }
};
