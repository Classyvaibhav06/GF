import mongoose from 'mongoose';

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  avatar: {
    type: String,
    required: [true, 'Please add an avatar URL']
  },
  personality: {
    type: [String],
    required: true
  },
  speakingStyle: {
    type: [String],
    required: true
  },
  interests: {
    type: [String],
    default: []
  },
  systemPrompt: {
    type: String,
    required: [true, 'Please add a base system prompt']
  },
  voiceId: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Character', characterSchema);
