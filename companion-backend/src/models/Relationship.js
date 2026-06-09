import mongoose from 'mongoose';

const relationshipSchema = new mongoose.Schema({
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
  affectionLevel: {
    type: String,
    enum: ['Stranger', 'Friend', 'Close Friend', 'Best Friend', 'Partner'],
    default: 'Stranger'
  },
  interactionCount: {
    type: Number,
    default: 0
  },
  lastInteraction: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

relationshipSchema.index({ userId: 1, characterId: 1 }, { unique: true });

export default mongoose.model('Relationship', relationshipSchema);
