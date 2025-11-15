import React, { useState } from 'react';

const InfoPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('try');

  const tryTheseThings = [
    {
      icon: '💬',
      title: 'Ask about orders',
      example: 'Can you help me track my order?',
      description: 'Get help with order status, tracking, and delivery information',
    },
    {
      icon: '🔄',
      title: 'Request a return',
      example: 'I want to return an item',
      description: 'Initiate returns and refunds for your purchases',
    },
    {
      icon: '🚚',
      title: 'Shipping questions',
      example: 'When will my package arrive?',
      description: 'Check shipping status and delivery estimates',
    },
    {
      icon: '💳',
      title: 'Payment issues',
      example: 'I have a billing question',
      description: 'Resolve payment and billing inquiries',
    },
    {
      icon: '🎤',
      title: 'Try voice chat',
      example: 'Click "Start Voice Chat" button below',
      description: 'Have a real-time voice conversation with our AI agent',
    },
  ];

  const serverSideInfo = [
    {
      title: 'Session Management',
      description: 'Each conversation starts with a unique ticket ID. The server creates a MongoDB document to track your session and all messages.',
      icon: '🎫',
      code: `// Server creates a ticket when you start a session
const ticket = new Ticket({
  ticketId: 'TICKET-ABC123',
  status: 'open'
});
await ticket.save();`,
    },
    {
      title: 'Message Processing',
      description: 'Your messages are sent to the server via POST /api/messages. The server uses intent detection to understand your request and generates a response using Gemini LLM.',
      icon: '🤖',
      code: `// Server processes your message
const aiResponse = await processMessage(text, conversationHistory);
// Uses Gemini LLM for intelligent responses
const response = await gemini.generateContent({
  model: 'gemini-2.0-flash',
  messages: conversationHistory
});`,
    },
    {
      title: 'Voice Agent Creation',
      description: 'When you start voice chat, the server creates an Agora Conversational AI agent. The agent joins an RTC channel and uses ASR (speech recognition), LLM (language model), and TTS (text-to-speech) for real-time voice interaction.',
      icon: '🎙️',
      code: `// Server starts voice agent
await agoraConversationalAI.startAgent({
  name: 'swiftbuy-agent',
  channelName: 'channel-123',
  userId: '1001',
  llm: { url: 'gemini-api', api_key: '...' },
  tts: { vendor: 'elevenlabs', params: {...} },
  asr: { vendor: 'ares', language: 'en-US' }
});`,
    },
    {
      title: 'RTC Token Generation',
      description: 'The server generates secure RTC tokens using your Agora App Certificate. These tokens allow you to join the voice channel securely.',
      icon: '🔐',
      code: `// Server generates RTC token for user
const token = RtcTokenBuilder.buildTokenWithUid(
  appId,
  appCertificate,
  channelName,
  userId,
  RtcRole.PUBLISHER,
  expireTime
);`,
    },
    {
      title: 'Real-time Audio Streaming',
      description: 'Your microphone audio is captured by Agora RTC SDK, sent to the server, processed by the AI agent, and the response is streamed back as audio using ElevenLabs TTS.',
      icon: '📡',
      code: `// Frontend: Join channel and publish audio
await client.join(appId, channelName, token, userId);
const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
await client.publish(audioTrack);

// Server: Agent processes audio and responds
// ASR → LLM → TTS → Stream back to user`,
    },
    {
      title: 'Message Storage',
      description: 'All messages are stored in MongoDB with timestamps, sender information, and metadata. The conversation history is used to provide context-aware responses.',
      icon: '💾',
      code: `// Server saves messages to MongoDB
const message = new Message({
  ticketId: 'TICKET-ABC123',
  text: 'Hello',
  sender: 'user',
  intent: 'greeting',
  metadata: { source: 'knowledge-base' }
});
await message.save();`,
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold">How It Works</h2>
            <p className="text-sm text-blue-100">Learn about the system architecture</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab('try')}
          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'try'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          ✨ Try These
        </button>
        <button
          onClick={() => setActiveTab('server')}
          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'server'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
          }`}
        >
          ⚙️ Server Architecture
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[60vh] overflow-y-auto">
        {activeTab === 'try' && (
          <div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Here are some things you can try with our AI support agent. Click on any suggestion to see an example message.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tryTheseThings.map((item, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => {
                    if (item.example && !item.example.includes('Click')) {
                      // Could trigger a message send here
                      console.log('Example:', item.example);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-800 mb-1 text-sm">{item.title}</h5>
                      <p className="text-xs text-gray-600 mb-2 leading-relaxed">{item.description}</p>
                      <div className="bg-white rounded px-3 py-2 text-xs text-gray-700 font-mono border border-gray-200 break-words">
                        "{item.example}"
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'server' && (
          <div>
            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              Understanding how the server processes your requests and handles the conversation flow.
            </p>
            <div className="space-y-4">
              {serverSideInfo.map((info, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl flex-shrink-0">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-800 mb-2 text-sm">{info.title}</h5>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">{info.description}</p>
                      {info.code && (
                        <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                          <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-words">
                            <code>{info.code}</code>
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Technical Stack */}
            <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
              <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <span>🛠️</span>
                Technical Stack
              </h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-lg p-2 mb-1">
                    <span className="text-xs font-semibold text-blue-700">Frontend</span>
                  </div>
                  <p className="text-xs text-gray-600">React + Vite</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-lg p-2 mb-1">
                    <span className="text-xs font-semibold text-green-700">Backend</span>
                  </div>
                  <p className="text-xs text-gray-600">Node.js + Express</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-lg p-2 mb-1">
                    <span className="text-xs font-semibold text-purple-700">Database</span>
                  </div>
                  <p className="text-xs text-gray-600">MongoDB</p>
                </div>
                <div className="text-center">
                  <div className="bg-orange-100 rounded-lg p-2 mb-1">
                    <span className="text-xs font-semibold text-orange-700">Voice</span>
                  </div>
                  <p className="text-xs text-gray-600">Agora RTC</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">Gemini LLM</span>
                <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded">ElevenLabs TTS</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">Agora ASR</span>
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">Tailwind CSS</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
