import Memory from '../models/Memory.js';

// @desc    Get all memories for a user/character pair
// @route   GET /api/memory/:characterId
// @access  Private
export const getMemories = async (req, res, next) => {
  try {
    const { characterId } = req.params;
    
    // Pagination defaults
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = { userId: req.user.id, characterId };
    
    // Optional category filter
    if (req.query.category) {
      query.category = req.query.category;
    }

    const memories = await Memory.find(query)
      .sort('-importanceScore -updatedAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Memory.countDocuments(query);

    res.status(200).json({
      status: 'success',
      count: memories.length,
      total,
      data: memories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a memory
// @route   PUT /api/memory/:id
// @access  Private
export const updateMemory = async (req, res, next) => {
  try {
    let memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ status: 'fail', message: 'Memory not found' });
    }

    // Ensure user owns this memory
    if (memory.userId.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to update this memory' });
    }

    // Only allow updating text, category, and importance. Embeddings would need regeneration, which we skip in simple manual updates.
    const fieldsToUpdate = {
      memoryText: req.body.memoryText || memory.memoryText,
      category: req.body.category || memory.category,
      importanceScore: req.body.importanceScore || memory.importanceScore
    };

    memory = await Memory.findByIdAndUpdate(req.params.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: memory
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a memory
// @route   DELETE /api/memory/:id
// @access  Private
export const deleteMemory = async (req, res, next) => {
  try {
    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({ status: 'fail', message: 'Memory not found' });
    }

    if (memory.userId.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to delete this memory' });
    }

    await memory.deleteOne();

    res.status(200).json({
      status: 'success',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
