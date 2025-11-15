import Ticket from '../models/Ticket.js';
import agoraConversationalAI from '../services/agoraConversationalAI.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate RTC token for user to join channel
 */
export const generateUserToken = async (req, res) => {
  try {
    const { channelName, userId } = req.body;

    if (!channelName) {
      return res.status(400).json({
        success: false,
        message: 'channelName is required',
      });
    }

    const uid = userId ? Number(userId) : 0;
    const expireTime = req.body.expireTime || 3600; // Default 1 hour

    const token = agoraConversationalAI.generateRTCToken(channelName, uid, expireTime);

    res.status(200).json({
      success: true,
      token,
      channelName,
      userId: uid,
      expireTime,
    });
  } catch (error) {
    console.error('Error generating user token:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate RTC token',
      error: error.message,
    });
  }
};

/**
 * Start a voice agent for a ticket
 */
export const startVoiceAgent = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'ticketId is required',
      });
    }

    // Find or create ticket
    let ticket = await Ticket.findOne({ ticketId });
    if (!ticket) {
      ticket = new Ticket({
        ticketId,
        status: 'open',
      });
      await ticket.save();
    }

    // Check if agent already exists for this ticket
    if (ticket.metadata?.get('agentId')) {
      const existingAgentId = ticket.metadata.get('agentId');
      try {
        const status = await agoraConversationalAI.getAgentStatus(existingAgentId);
        if (status.status === 'RUNNING' || status.status === 'STARTING') {
          return res.status(200).json({
            success: true,
            message: 'Agent already running for this ticket',
            agentId: existingAgentId,
            channelName: ticket.metadata?.get('channelName'),
            status: status.status,
          });
        }
      } catch (error) {
        // Agent doesn't exist or failed, continue to create new one
        console.log('Existing agent not found, creating new one');
      }
    }

    // Generate unique identifiers
    const agentName = `swiftbuy-agent-${ticketId}-${Date.now()}`;
    const channelName = `swiftbuy-channel-${ticketId}-${uuidv4().split('-')[0]}`;
    const userId = req.body.userId || String(Math.floor(Math.random() * 1000000) + 1000);
    const agentRtcUid = req.body.agentRtcUid || 0;

    // Start the agent
    const result = await agoraConversationalAI.startAgent({
      name: agentName,
      channelName,
      userId,
      agentRtcUid,
      customConfig: req.body.config || {},
    });

    // Store agent info in ticket metadata
    if (!ticket.metadata) {
      ticket.metadata = new Map();
    }
    ticket.metadata.set('agentId', result.agentId);
    ticket.metadata.set('agentName', result.agentName);
    ticket.metadata.set('channelName', result.channelName);
    ticket.metadata.set('userId', userId);
    ticket.metadata.set('agentRtcUid', String(agentRtcUid));
    ticket.metadata.set('agentStatus', result.status);
    await ticket.save();

    res.status(201).json({
      success: true,
      message: 'Voice agent started successfully',
      agentId: result.agentId,
      channelName: result.channelName,
      userId,
      agentRtcUid,
      status: result.status,
      appId: process.env.AGORA_APP_ID,
    });
  } catch (error) {
    console.error('Error starting voice agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start voice agent',
      error: error.message,
    });
  }
};

/**
 * Stop a voice agent for a ticket
 */
export const stopVoiceAgent = async (req, res) => {
  try {
    const { ticketId, agentId } = req.body;

    if (!ticketId && !agentId) {
      return res.status(400).json({
        success: false,
        message: 'Either ticketId or agentId is required',
      });
    }

    let targetAgentId = agentId;

    // If ticketId provided, find agent from ticket
    if (ticketId && !agentId) {
      const ticket = await Ticket.findOne({ ticketId });
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      targetAgentId = ticket.metadata?.get('agentId');
      if (!targetAgentId) {
        return res.status(404).json({
          success: false,
          message: 'No agent found for this ticket',
        });
      }
    }

    // Stop the agent
    const result = await agoraConversationalAI.stopAgent(targetAgentId);

    // Update ticket metadata if ticketId was provided
    if (ticketId) {
      const ticket = await Ticket.findOne({ ticketId });
      if (ticket && ticket.metadata) {
        ticket.metadata.set('agentStatus', 'STOPPED');
        await ticket.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Voice agent stopped successfully',
      agentId: targetAgentId,
      ...result,
    });
  } catch (error) {
    console.error('Error stopping voice agent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop voice agent',
      error: error.message,
    });
  }
};

/**
 * Get agent status
 */
export const getAgentStatus = async (req, res) => {
  try {
    const { ticketId, agentId } = req.query;

    if (!ticketId && !agentId) {
      return res.status(400).json({
        success: false,
        message: 'Either ticketId or agentId is required',
      });
    }

    let targetAgentId = agentId;

    // If ticketId provided, find agent from ticket
    if (ticketId && !agentId) {
      const ticket = await Ticket.findOne({ ticketId });
      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found',
        });
      }

      targetAgentId = ticket.metadata?.get('agentId');
      if (!targetAgentId) {
        return res.status(404).json({
          success: false,
          message: 'No agent found for this ticket',
        });
      }
    }

    const result = await agoraConversationalAI.getAgentStatus(targetAgentId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error getting agent status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get agent status',
      error: error.message,
    });
  }
};

/**
 * List all agents
 */
export const listAgents = async (req, res) => {
  try {
    const result = await agoraConversationalAI.listAgents();

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error listing agents:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list agents',
      error: error.message,
    });
  }
};

