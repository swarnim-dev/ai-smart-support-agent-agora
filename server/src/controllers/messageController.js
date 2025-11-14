import Message from '../models/Message.js';
import Ticket from '../models/Ticket.js';
import { processMessage } from '../services/nlpService.js';

export const sendMessage = async (req, res) => {
  try {
    const { ticketId, text } = req.body;
    
    if (!ticketId || !text) {
      return res.status(400).json({
        success: false,
        message: 'ticketId and text are required',
      });
    }
    
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }
    
    const userMessage = new Message({
      ticketId,
      text,
      sender: 'user',
    });
    await userMessage.save();
    
    const aiResponse = await processMessage(text);
    
    const agentMessage = new Message({
      ticketId,
      text: aiResponse.text,
      sender: 'agent',
      intent: aiResponse.intent,
      confidence: aiResponse.confidence,
    });
    await agentMessage.save();
    
    res.status(201).json({
      success: true,
      message: {
        _id: agentMessage._id,
        text: agentMessage.text,
        sender: agentMessage.sender,
        timestamp: agentMessage.createdAt,
        intent: agentMessage.intent,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message,
    });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    const ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found',
      });
    }
    
    const messages = await Message.find({ ticketId })
      .sort({ createdAt: 1 })
      .select('_id text sender createdAt intent');
    
    res.status(200).json({
      success: true,
      messages: messages.map((msg) => ({
        _id: msg._id,
        text: msg.text,
        sender: msg.sender,
        timestamp: msg.createdAt,
        intent: msg.intent,
      })),
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
      error: error.message,
    });
  }
};

