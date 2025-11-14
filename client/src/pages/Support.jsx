import React, { useState, useEffect, useRef } from 'react';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import { startSession, sendMessage, getMessages } from '../utils/api';

const Support = () => {
  const [ticketId, setTicketId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const data = await startSession();
        setTicketId(data.ticketId);
        setLoading(false);
      } catch (error) {
        console.error('Failed to start session:', error);
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    if (!ticketId) return;

    const fetchMessages = async () => {
      try {
        const data = await getMessages(ticketId);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
    intervalRef.current = setInterval(fetchMessages, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ticketId]);

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
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">Support Chat</h1>
        {ticketId && (
          <p className="text-sm text-blue-100 mt-1">Ticket ID: {ticketId}</p>
        )}
      </div>
      <ChatWindow messages={messages} ticketId={ticketId} />
      <MessageInput onSend={handleSend} disabled={sending || !ticketId} />
    </div>
  );
};

export default Support;

