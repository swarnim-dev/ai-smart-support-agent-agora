import React, { useState, useEffect, useRef } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { startVoiceAgent, stopVoiceAgent, getVoiceAgentStatus } from '../utils/api';

const VoiceAgent = ({ ticketId, appId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [agentStatus, setAgentStatus] = useState(null);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const clientRef = useRef(null);
  const localAudioTrackRef = useRef(null);
  const statusIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      handleDisconnect();
    };
  }, []);

  const checkAgentStatus = async () => {
    if (!ticketId) return;
    
    try {
      const status = await getVoiceAgentStatus(ticketId);
      setAgentStatus(status);
      
      if (status.status === 'STOPPED' || status.status === 'FAILED') {
        setIsConnected(false);
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
        }
      }
    } catch (error) {
      console.error('Failed to check agent status:', error);
    }
  };

  const handleConnect = async () => {
    if (!ticketId || !appId) {
      setError('Ticket ID or App ID is missing');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Step 1: Start the voice agent
      const userId = String(Math.floor(Math.random() * 1000000) + 1000);
      const result = await startVoiceAgent(ticketId, userId);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to start voice agent');
      }

      setAgentStatus(result);
      const { channelName, userId: resultUserId, appId: agentAppId } = result;
      
      // Use appId from result or fallback to prop
      const finalAppId = agentAppId || appId;
      
      if (!finalAppId) {
        throw new Error('App ID is required. Please set VITE_AGORA_APP_ID in your .env file.');
      }

      // Step 2: Initialize Agora RTC Client
      const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
      clientRef.current = client;

      // Step 3: Set up event handlers
      client.on('user-published', async (user, mediaType) => {
        if (mediaType === 'audio') {
          try {
            await client.subscribe(user, mediaType);
            console.log('✅ Subscribed to agent audio');
            user.audioTrack.play();
          } catch (error) {
            console.error('Failed to subscribe to agent audio:', error);
          }
        }
      });

      client.on('user-unpublished', (user, mediaType) => {
        if (mediaType === 'audio') {
          console.log('Agent audio unpublished');
        }
      });

      client.on('user-left', (user) => {
        console.log('User left:', user.uid);
      });

      // Step 4: Join the channel
      // Note: For production, you should generate a proper RTC token
      // For now, using empty string (works if token authentication is disabled)
      await client.join(finalAppId, channelName, null, resultUserId || userId);

      // Step 5: Create and publish local audio track
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = localAudioTrack;
      await client.publish(localAudioTrack);

      setIsConnected(true);
      setIsConnecting(false);

      // Start monitoring agent status
      statusIntervalRef.current = setInterval(checkAgentStatus, 5000);
      checkAgentStatus();

      console.log('✅ Connected to voice agent');
    } catch (error) {
      console.error('Failed to connect to voice agent:', error);
      setError(error.message || 'Failed to connect to voice agent');
      setIsConnecting(false);
      
      // Cleanup on error
      if (clientRef.current) {
        try {
          await clientRef.current.leave();
        } catch (e) {
          console.error('Error leaving channel:', e);
        }
        clientRef.current = null;
      }
    }
  };

  const handleDisconnect = async () => {
    try {
      // Stop monitoring
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
        statusIntervalRef.current = null;
      }

      // Unpublish and stop local audio track
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }

      // Leave channel
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }

      // Stop the agent
      if (ticketId) {
        try {
          await stopVoiceAgent(ticketId);
        } catch (error) {
          console.error('Failed to stop agent:', error);
        }
      }

      setIsConnected(false);
      setAgentStatus(null);
      setIsMuted(false);
      console.log('✅ Disconnected from voice agent');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const handleToggleMute = () => {
    if (localAudioTrackRef.current) {
      if (isMuted) {
        localAudioTrackRef.current.setMuted(false);
        setIsMuted(false);
      } else {
        localAudioTrackRef.current.setMuted(true);
        setIsMuted(true);
      }
    }
  };

  if (!ticketId) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          <h3 className="font-semibold text-gray-800">Voice Agent</h3>
        </div>
        {agentStatus && (
          <span className={`text-xs px-2 py-1 rounded-full ${
            agentStatus.status === 'RUNNING' 
              ? 'bg-green-100 text-green-700' 
              : agentStatus.status === 'STARTING'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {agentStatus.status}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting || !ticketId}
          className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center gap-2"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              Start Voice Chat
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected to voice agent</span>
          </div>
          
          {agentStatus?.channelName && (
            <div className="text-xs text-gray-500">
              Channel: {agentStatus.channelName}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleToggleMute}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                isMuted
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isMuted ? (
                <>
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M17 10l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  Unmute
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Mute
                </>
              )}
            </button>
            
            <button
              onClick={handleDisconnect}
              className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-medium"
            >
              <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              End Call
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;

