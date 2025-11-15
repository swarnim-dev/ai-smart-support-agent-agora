# How to Access Agora Conversational AI

This guide explains how to access and use the Agora Conversational AI voice agents in your application.

## Prerequisites

1. **Agora Credentials** (required):
   - `AGORA_APP_ID`: Your Agora App ID
   - `AGORA_REST_API_KEY`: Customer ID
   - `AGORA_REST_API_SECRET`: Customer Secret
   - `AGORA_APP_CERTIFICATE`: App Certificate (for RTC token generation)

2. **LLM Configuration** (Gemini):
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `AGORA_LLM_MODEL`: Model name (default: `gemini-2.0-flash`)

3. **TTS Configuration** (ElevenLabs):
   - `ELEVENLABS_API_KEY`: Your ElevenLabs API key
   - `ELEVENLABS_VOICE_ID`: Voice ID from ElevenLabs

Make sure these are set in your `server/.env` file.

## API Endpoints

All endpoints are available at: `http://localhost:3001/api/voice-agent`

### 1. Start a Voice Agent

**Endpoint:** `POST /api/voice-agent/start`

**Request Body:**
```json
{
  "ticketId": "TICKET-ABC123",
  "userId": "1001",
  "agentRtcUid": 0,
  "config": {
    "llm": {
      "system_messages": [...],
      "params": { "model": "gemini-2.0-flash" }
    },
    "tts": {
      "vendor": "elevenlabs",
      "params": { "voice_id": "your_voice_id" }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voice agent started successfully",
  "agentId": "1NT29X10YHxxxxxWJOXLYHNYB",
  "channelName": "swiftbuy-channel-TICKET-ABC123-abc123",
  "userId": "1001",
  "agentRtcUid": 0,
  "status": "RUNNING",
  "appId": "your_app_id"
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3001/api/voice-agent/start \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "TICKET-ABC123",
    "userId": "1001"
  }'
```

### 2. Stop a Voice Agent

**Endpoint:** `POST /api/voice-agent/stop`

**Request Body (using ticketId):**
```json
{
  "ticketId": "TICKET-ABC123"
}
```

**OR (using agentId directly):**
```json
{
  "agentId": "1NT29X10YHxxxxxWJOXLYHNYB"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voice agent stopped successfully",
  "agentId": "1NT29X10YHxxxxxWJOXLYHNYB"
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:3001/api/voice-agent/stop \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "TICKET-ABC123"}'
```

### 3. Get Agent Status

**Endpoint:** `GET /api/voice-agent/status`

**Query Parameters:**
- `ticketId` (optional): Ticket ID to find agent
- `agentId` (optional): Direct agent ID

**Example:**
```bash
curl "http://localhost:3001/api/voice-agent/status?ticketId=TICKET-ABC123"
```

**Response:**
```json
{
  "success": true,
  "agentId": "1NT29X10YHxxxxxWJOXLYHNYB",
  "status": "RUNNING",
  "create_ts": 1737111452
}
```

### 4. List All Agents

**Endpoint:** `GET /api/voice-agent/list`

**Example:**
```bash
curl http://localhost:3001/api/voice-agent/list
```

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "agent_id": "1NT29X10YHxxxxxWJOXLYHNYB",
      "status": "RUNNING",
      "create_ts": 1737111452
    }
  ]
}
```

## Using from Frontend (JavaScript/React)

### Step 1: Add API Functions

Add these functions to `client/src/utils/api.js`:

```javascript
export const startVoiceAgent = async (ticketId, userId = null, config = {}) => {
  const response = await api.post('/voice-agent/start', {
    ticketId,
    userId,
    ...config,
  });
  return response.data;
};

export const stopVoiceAgent = async (ticketId) => {
  const response = await api.post('/voice-agent/stop', { ticketId });
  return response.data;
};

export const getVoiceAgentStatus = async (ticketId) => {
  const response = await api.get(`/voice-agent/status?ticketId=${ticketId}`);
  return response.data;
};

export const listVoiceAgents = async () => {
  const response = await api.get('/voice-agent/list');
  return response.data;
};
```

### Step 2: Use in React Component

```javascript
import { useState } from 'react';
import { startVoiceAgent, stopVoiceAgent, getVoiceAgentStatus } from '../utils/api';

const VoiceSupport = ({ ticketId }) => {
  const [agentStatus, setAgentStatus] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartAgent = async () => {
    setIsStarting(true);
    try {
      const result = await startVoiceAgent(ticketId, '1001');
      setAgentStatus(result);
      console.log('Agent started:', result);
      console.log('Channel Name:', result.channelName);
      console.log('App ID:', result.appId);
      // Now you can use Agora RTC SDK to join the channel
    } catch (error) {
      console.error('Failed to start agent:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopAgent = async () => {
    try {
      await stopVoiceAgent(ticketId);
      setAgentStatus(null);
      console.log('Agent stopped');
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  return (
    <div>
      {!agentStatus ? (
        <button onClick={handleStartAgent} disabled={isStarting}>
          {isStarting ? 'Starting...' : 'Start Voice Agent'}
        </button>
      ) : (
        <div>
          <p>Agent Status: {agentStatus.status}</p>
          <p>Channel: {agentStatus.channelName}</p>
          <button onClick={handleStopAgent}>Stop Agent</button>
        </div>
      )}
    </div>
  );
};
```

## Complete Workflow

### 1. Start a Text Session (if not already started)

```bash
curl -X POST http://localhost:3001/api/session/start
```

Response gives you a `ticketId`.

### 2. Start Voice Agent for that Ticket

```bash
curl -X POST http://localhost:3001/api/voice-agent/start \
  -H "Content-Type: application/json" \
  -d '{
    "ticketId": "TICKET-ABC123",
    "userId": "1001"
  }'
```

This returns:
- `agentId`: Unique agent identifier
- `channelName`: RTC channel name to join
- `appId`: Agora App ID
- `status`: Agent status (RUNNING, STARTING, etc.)

### 3. Join the Channel with Agora RTC SDK

You'll need to integrate Agora RTC SDK in your frontend to actually connect to the voice channel. The agent is now listening and ready to respond.

**Example with Agora RTC SDK:**
```javascript
import AgoraRTC from 'agora-rtc-sdk-ng';

const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });

// Join the channel
await client.join(
  appId,           // From startVoiceAgent response
  channelName,     // From startVoiceAgent response
  token,           // Generate RTC token (or use empty string for testing)
  userId           // User ID
);

// Subscribe to remote audio
client.on('user-published', async (user, mediaType) => {
  if (mediaType === 'audio') {
    await client.subscribe(user, mediaType);
    user.audioTrack.play();
  }
});

// Publish local audio
const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
await client.publish(localAudioTrack);
```

### 4. Monitor Agent Status

```bash
curl "http://localhost:3001/api/voice-agent/status?ticketId=TICKET-ABC123"
```

### 5. Stop Agent When Done

```bash
curl -X POST http://localhost:3001/api/voice-agent/stop \
  -H "Content-Type: application/json" \
  -d '{"ticketId": "TICKET-ABC123"}'
```

## Agent Status Values

- `IDLE`: Agent is idle
- `STARTING`: Agent is being started
- `RUNNING`: Agent is running and ready
- `STOPPING`: Agent is stopping
- `STOPPED`: Agent has exited
- `RECOVERING`: Agent is recovering
- `FAILED`: Agent failed to execute

## Troubleshooting

### Agent Not Starting

1. **Check Environment Variables:**
   ```bash
   # In server directory
   cat .env | grep AGORA
   ```

2. **Check Server Logs:**
   Look for initialization messages:
   ```
   🔧 Agora Conversational AI Service initialized:
      App ID: ✅ Set
      REST API Key: ✅ Set
      ...
   ```

3. **Verify Credentials:**
   - Ensure `AGORA_APP_ID` is correct
   - Ensure `AGORA_REST_API_KEY` and `AGORA_REST_API_SECRET` are correct
   - Ensure `GEMINI_API_KEY` is set
   - Ensure `ELEVENLABS_API_KEY` is set

### Agent Status is FAILED

1. Check if LLM API key is valid
2. Check if TTS API key is valid
3. Check if RTC token generation is working (requires `AGORA_APP_CERTIFICATE`)
4. Review server logs for detailed error messages

### Agent Not Responding

1. Verify the agent status is `RUNNING`
2. Check if you've joined the RTC channel correctly
3. Ensure microphone permissions are granted
4. Check network connectivity

## Next Steps

1. **Integrate Agora RTC SDK** in your frontend to actually connect to the voice channel
2. **Add UI controls** for starting/stopping voice agents
3. **Handle audio streams** for real-time voice interaction
4. **Add error handling** and retry logic
5. **Implement agent status monitoring** with polling or WebSocket

For more details, see:
- [Agora Conversational AI Documentation](https://docs.agora.io/en/conversational-ai/rest-api/join)
- [Agora RTC SDK Documentation](https://docs.agora.io/en/video-calling/get-started/get-started-sdk)

