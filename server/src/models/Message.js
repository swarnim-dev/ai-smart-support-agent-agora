import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      index: true,
    },
    text: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      enum: ['user', 'agent'],
      required: true,
    },
    intent: {
      type: String,
    },
    confidence: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Message', messageSchema);

