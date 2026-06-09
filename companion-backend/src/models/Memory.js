import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  characterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character',
    required: true
  },
  memoryText: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['personal', 'career', 'education', 'hobbies', 'relationship', 'preferences', 'goals', 'other'],
    default: 'other'
  },
  importanceScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  embedding: {
    type: [Number], // Array of numbers representing the vector
    required: false
  }
}, { timestamps: true });

// Basic index for quick fetching by user/character
memorySchema.index({ userId: 1, characterId: 1 });

export default mongoose.model('Memory', memorySchema);
