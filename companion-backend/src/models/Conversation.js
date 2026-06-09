import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
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
  title: {
    type: String,
    default: 'New Chat'
  },
  lastMessage: {
    type: String,
    default: ''
  }
}, { timestamps: true });

// Create compound index for faster lookup
conversationSchema.index({ userId: 1, characterId: 1 });

export default mongoose.model('Conversation', conversationSchema);
