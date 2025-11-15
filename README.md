# Smart AI Support Text Chat Scaffold

A minimal text-chat-only starter scaffold with React + Tailwind frontend and Node.js (Express) + MongoDB backend.

## Project Structure

```
/client          # React frontend with Vite
/server          # Express backend with MongoDB
```

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and set your configuration:
```
MONGODB_URI=mongodb://localhost:27017/smart-ai-support
PORT=3001

# Agora Conversational AI Configuration (for voice agents)
AGORA_APP_ID=your_app_id
AGORA_REST_API_KEY=your_customer_id
AGORA_REST_API_SECRET=your_customer_secret
AGORA_APP_CERTIFICATE=your_app_certificate

# LLM Configuration (for voice agents)
# Set AGORA_LLM_PROVIDER=gemini for Gemini or 'openai' for OpenAI
AGORA_LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
# Note: For Gemini, the API key is automatically embedded in the URL
AGORA_LLM_MODEL=gemini-2.0-flash

# TTS Configuration (for voice agents)
# Set AGORA_TTS_PROVIDER=elevenlabs for ElevenLabs or 'microsoft' for Azure
AGORA_TTS_PROVIDER=elevenlabs
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_VOICE_ID=your_voice_id
```

Start MongoDB if running locally:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or use MongoDB Atlas cloud instance
```

Run the server:
```bash
npm run dev
```

Server will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file in the `client` directory:
```
VITE_API_URL=http://localhost:3001
VITE_AGORA_APP_ID=your_agora_app_id
```

Start the frontend:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Features

- **Ticket Creation**: Automatically creates a ticket when the Support page loads
- **Message Flow**: Send messages and receive AI-simulated replies
- **Message History**: Fetches and displays message transcript
- **Real-time Updates**: Polls for new messages every 5 seconds
- **Voice Agent Integration**: Direct frontend integration with Agora Conversational AI
  - Start/stop voice agents with one click
  - Real-time voice conversation with AI agent
  - Mute/unmute controls
  - Agent status monitoring

## API Endpoints

### POST /api/session/start
Creates a new support ticket session.

**Response:**
```json
{
  "success": true,
  "ticketId": "TICKET-ABC123",
  "message": "Session started successfully"
}
```

### POST /api/messages
Sends a message and receives an AI reply.

**Request:**
```json
{
  "ticketId": "TICKET-ABC123",
  "text": "Hello, I need help"
}
```

**Response:**
```json
{
  "success": true,
  "message": {
    "_id": "...",
    "text": "Hello! How can I help you today?",
    "sender": "agent",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "intent": "greeting"
  }
}
```

### GET /api/messages/:ticketId
Retrieves all messages for a ticket.

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "_id": "...",
      "text": "Hello",
      "sender": "user",
      "timestamp": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

## Agora Conversational AI Voice Agent Endpoints

The application now supports Agora's Conversational AI for voice-based customer support agents. These endpoints allow you to start, stop, and manage voice agents.

### POST /api/voice-agent/start
Starts a voice agent for a ticket.

**Request:**
```json
{
  "ticketId": "TICKET-ABC123",
  "userId": "1001",
  "agentRtcUid": 0,
  "config": {
    "llm": {
      "system_messages": [...],
      "params": { "model": "gpt-4" }
    },
    "tts": {
      "vendor": "microsoft",
      "params": { "voice_name": "en-US-JennyNeural" }
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

### POST /api/voice-agent/stop
Stops a voice agent.

**Request:**
```json
{
  "ticketId": "TICKET-ABC123"
}
```
or
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

### GET /api/voice-agent/status
Gets the status of a voice agent.

**Query Parameters:**
- `ticketId` (optional): Ticket ID to find agent
- `agentId` (optional): Direct agent ID

**Response:**
```json
{
  "success": true,
  "agentId": "1NT29X10YHxxxxxWJOXLYHNYB",
  "status": "RUNNING",
  "create_ts": 1737111452
}
```

### GET /api/voice-agent/list
Lists all active agents for the project.

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

## Agora Conversational AI Configuration

The voice agent uses Agora's Conversational AI API which requires:

1. **Agora Credentials:**
   - `AGORA_APP_ID`: Your Agora App ID
   - `AGORA_REST_API_KEY`: Customer ID (for REST API authentication)
   - `AGORA_REST_API_SECRET`: Customer Secret (for REST API authentication)
   - `AGORA_APP_CERTIFICATE`: App Certificate (for RTC token generation)

2. **LLM Configuration:**
   - `AGORA_LLM_PROVIDER`: LLM provider - `gemini` (default) or `openai`
   - **For Gemini:**
     - `GEMINI_API_KEY`: Google Gemini API key (automatically embedded in URL)
     - `AGORA_LLM_URL`: Custom Gemini endpoint (optional, auto-generated if not provided)
     - `AGORA_LLM_MODEL`: Gemini model name (default: `gemini-2.0-flash`)
     - Note: Agora requires Gemini API key in the URL format: `https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?alt=sse&key={api_key}`
   - **For OpenAI (fallback):**
     - `OPENAI_API_KEY`: OpenAI API key
     - `AGORA_LLM_URL`: OpenAI endpoint (default: `https://api.openai.com/v1/chat/completions`)
     - `AGORA_LLM_MODEL`: OpenAI model name (default: `gpt-3.5-turbo`)

3. **TTS Configuration:**
   - `AGORA_TTS_PROVIDER`: TTS provider - `elevenlabs` (default) or `microsoft`
   - **For ElevenLabs:**
     - `ELEVENLABS_API_KEY`: ElevenLabs API key (set as `key` in params)
     - `ELEVENLABS_VOICE_ID`: ElevenLabs voice ID (default: `21m00Tcm4TlvDq8ikWAM`)
     - `AGORA_TTS_MODEL_ID`: ElevenLabs model ID (default: `eleven_flash_v2_5`)
     - `AGORA_TTS_SAMPLE_RATE`: Sample rate (default: `24000`)
   - **For Microsoft Azure (fallback):**
     - `AZURE_TTS_KEY`: Azure Text-to-Speech key
     - `AZURE_TTS_REGION`: Azure region (default: `eastus`)
     - `AGORA_TTS_VOICE`: Voice name (default: `en-US-AndrewMultilingualNeural`)

4. **ASR Configuration:**
   - `AGORA_ASR_LANGUAGE`: Language code (default: en-US)
   - `AGORA_ASR_VENDOR`: ASR vendor (default: ares)

For more details, see the [Agora Conversational AI Documentation](https://docs.agora.io/en/conversational-ai/rest-api/join).

## Future Integration Points

### AI/LLM Integration
- Replace `server/src/services/nlpService.js` with actual LLM API calls (OpenAI, Anthropic, etc.)
- Enhance intent detection with ML models
- Add context-aware responses

### Agora Voice Integration
- ✅ **Integrated**: Agora Conversational AI API for voice agents
- ✅ **Implemented**: Voice agent lifecycle management (start/stop/status)
- 🔄 **TODO**: Frontend integration with Agora RTC SDK for voice interaction
- 🔄 **TODO**: Real-time audio streaming between client and voice agent

### Advanced Features
- WebSocket support for real-time messaging (replace polling)
- User authentication
- Agent handoff functionality
- Analytics and reporting

## Development

- Client uses Vite for fast HMR
- Server uses nodemon for auto-restart
- MongoDB models use Mongoose ODM
- CORS enabled for local development

## Troubleshooting

- Ensure MongoDB is running before starting the server
- Check that ports 3000 and 3001 are available
- Verify `.env` file has correct MongoDB connection string
- Check browser console and server logs for errors

