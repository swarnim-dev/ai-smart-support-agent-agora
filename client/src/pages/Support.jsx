import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import VoiceAgent from '../components/VoiceAgent';
import InfoPanel from '../components/InfoPanel';
import { startSession, sendMessage, getMessages, checkHealth } from '../utils/api';

const Support = () => {
  const [ticketId, setTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const intervalRef = useRef(null);
  const healthCheckRef = useRef(null);

  useEffect(() => {
    const checkServerHealth = async () => {
      const online = await checkHealth();
      setIsOnline(online);
    };

    checkServerHealth();
    healthCheckRef.current = setInterval(checkServerHealth, 5000);

    return () => {
      if (healthCheckRef.current) {
        clearInterval(healthCheckRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const initializeSession = async () => {
      if (!isOnline) {
        setLoading(false);
        return;
      }

      try {
        const data = await startSession();
        setTicketId(data.ticketId);
        setLoading(false);
      } catch (error) {
        console.error('Failed to start session:', error);
        setLoading(false);
      }
    };

    if (isOnline) {
      initializeSession();
    } else {
      setLoading(false);
    }
  }, [isOnline]);

  useEffect(() => {
    if (!ticketId || !isOnline) return;

    const fetchMessages = async () => {
      try {
        const data = await getMessages(ticketId);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ticketId, isOnline]);

  const handleSend = async (text) => {
    if (!ticketId || sending) return;

    setSending(true);
    try {
      const userMessage = {
        _id: Date.now().toString(),
        text,
        sender: 'user',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      const data = await sendMessage(ticketId, text);
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <div className="text-gray-700 font-medium">Connecting to support...</div>
        </div>
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white rounded-full p-6 shadow-lg mb-4">
          <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Server Offline</h3>
        <p className="text-gray-600 text-center max-w-md mb-4">
          Unable to connect to the server. Please make sure the server is running.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  SwiftBuy Support
                </h1>
                {ticketId && (
                  <p className="text-sm text-blue-100 mt-1 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Ticket: {ticketId}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowInfoPanel(!showInfoPanel)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How It Works
                </button>
                <div className={`hidden md:flex items-center gap-2 text-sm transition-colors ${
                  isOnline ? 'text-green-200' : 'text-red-200'
                }`}>
                  {isOnline ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Online</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Offline</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 overflow-hidden relative">
          {showInfoPanel && (
            <div className="absolute inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
              <div className="w-full max-w-4xl">
                <InfoPanel onClose={() => setShowInfoPanel(false)} />
              </div>
            </div>
          )}
          <ChatWindow messages={messages} ticketId={ticketId} sending={sending} isOnline={isOnline} showInfoPanel={showInfoPanel} />
        </div>

        {/* Voice Agent */}
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <VoiceAgent ticketId={ticketId} appId={import.meta.env.VITE_AGORA_APP_ID} />
          </div>
        </div>

        {/* Message Input */}
        <div className="flex-shrink-0">
          <MessageInput onSend={handleSend} disabled={sending || !ticketId || !isOnline} />
        </div>
      </div>

      {/* Mobile Info Button */}
      <div className="lg:hidden fixed bottom-20 right-4 z-10">
        <button
          onClick={() => setShowInfoPanel(!showInfoPanel)}
          className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Support;

