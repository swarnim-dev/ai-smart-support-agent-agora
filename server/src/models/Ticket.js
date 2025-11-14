import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ['open', 'resolved', 'closed'],
      default: 'open',
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Ticket', ticketSchema);

