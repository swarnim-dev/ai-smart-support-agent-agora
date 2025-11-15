import express from 'express';
import {
  startVoiceAgent,
  stopVoiceAgent,
  getAgentStatus,
  listAgents,
} from '../controllers/voiceAgentController.js';

const router = express.Router();

// Start a voice agent for a ticket
router.post('/start', startVoiceAgent);

// Stop a voice agent
router.post('/stop', stopVoiceAgent);

// Get agent status
router.get('/status', getAgentStatus);

// List all agents
router.get('/list', listAgents);

export default router;

