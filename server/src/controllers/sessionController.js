import Ticket from '../models/Ticket.js';
import { v4 as uuidv4 } from 'uuid';

export const startSession = async (req, res) => {
  try {
    const ticketId = `TICKET-${uuidv4().split('-')[0].toUpperCase()}`;
    
    const ticket = new Ticket({
      ticketId,
      status: 'open',
    });
    
    await ticket.save();
    
    res.status(201).json({
      success: true,
      ticketId,
      message: 'Session started successfully',
    });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message,
    });
  }
};

