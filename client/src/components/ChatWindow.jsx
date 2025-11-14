import React from 'react';
import AgentBadge from './AgentBadge';

const ChatWindow = ({ messages, ticketId }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          Start a conversation by sending a message
        </div>
      ) : (
        messages.map((msg) => (
          <div
            key={msg._id || msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {msg.sender === 'agent' && (
                <div className="mb-1">
                  <AgentBadge />
                </div>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              <p
                className={`text-xs mt-1 ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatWindow;

