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

Edit `.env` and set your `MONGODB_URI`:
```
MONGODB_URI=mongodb://localhost:27017/smart-ai-support
PORT=3001
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
npm start
```

Frontend will run on `http://localhost:3000`

## Features

- **Ticket Creation**: Automatically creates a ticket when the Support page loads
- **Message Flow**: Send messages and receive AI-simulated replies
- **Message History**: Fetches and displays message transcript
- **Real-time Updates**: Polls for new messages every 2 seconds

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

## Future Integration Points

### AI/LLM Integration
- Replace `server/src/services/nlpService.js` with actual LLM API calls (OpenAI, Anthropic, etc.)
- Enhance intent detection with ML models
- Add context-aware responses

### Agora Voice Integration
- Add voice input/output capabilities
- Integrate Agora SDK for real-time audio
- Extend message model to support audio transcripts

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

