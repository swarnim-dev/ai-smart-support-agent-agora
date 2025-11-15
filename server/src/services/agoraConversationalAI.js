import axios from 'axios';
import agoraToken from 'agora-token';
const { RtcTokenBuilder, RtcRole } = agoraToken;

/**
 * Agora Conversational AI Service
 * Handles voice agent lifecycle management using Agora's Conversational AI API
 * Documentation: https://docs.agora.io/en/conversational-ai/rest-api/join
 */
class AgoraConversationalAIService {
  constructor() {
    this._initialized = false;
    this.baseURL = 'https://api.agora.io';
  }

  _initialize() {
    if (this._initialized) return;

    this.appId = process.env.AGORA_APP_ID;
    this.restApiKey = process.env.AGORA_REST_API_KEY; // Customer ID
    this.restApiSecret = process.env.AGORA_REST_API_SECRET; // Customer Secret
    this.appCertificate = process.env.AGORA_APP_CERTIFICATE; // For token generation

    // LLM Configuration
    // Support for Gemini and OpenAI
    const llmProvider = process.env.AGORA_LLM_PROVIDER || 'gemini'; // 'gemini' or 'openai'
    
    if (llmProvider === 'gemini') {
      // Gemini API configuration
      // Agora requires Gemini API key in the URL
      this.llmApiKey = process.env.GEMINI_API_KEY || process.env.AGORA_LLM_API_KEY;
      this.llmModel = process.env.AGORA_LLM_MODEL || 'gemini-2.0-flash';
      // Build Gemini URL with API key embedded (Agora format)
      if (this.llmApiKey) {
        this.llmUrl = process.env.AGORA_LLM_URL || 
          `https://generativelanguage.googleapis.com/v1beta/models/${this.llmModel}:streamGenerateContent?alt=sse&key=${this.llmApiKey}`;
      } else {
        this.llmUrl = process.env.AGORA_LLM_URL || 'https://generativelanguage.googleapis.com/v1beta/models';
      }
    } else {
      // OpenAI API configuration (fallback)
      this.llmUrl = process.env.AGORA_LLM_URL || 'https://api.openai.com/v1/chat/completions';
      this.llmApiKey = process.env.OPENAI_API_KEY || process.env.AGORA_LLM_API_KEY;
      this.llmModel = process.env.AGORA_LLM_MODEL || 'gpt-3.5-turbo';
    }
    this.llmProvider = llmProvider;

    // TTS Configuration
    // Support for ElevenLabs and Microsoft Azure
    const ttsProvider = process.env.AGORA_TTS_PROVIDER || 'elevenlabs'; // 'elevenlabs' or 'microsoft'
    
    if (ttsProvider === 'elevenlabs') {
      this.ttsVendor = 'elevenlabs';
      this.ttsKey = process.env.ELEVENLABS_API_KEY || process.env.AGORA_TTS_KEY;
      this.ttsVoice = process.env.ELEVENLABS_VOICE_ID || process.env.AGORA_TTS_VOICE || '21m00Tcm4TlvDq8ikWAM'; // Default ElevenLabs voice
      this.ttsModelId = process.env.AGORA_TTS_MODEL_ID || 'eleven_flash_v2_5';
      this.ttsSampleRate = process.env.AGORA_TTS_SAMPLE_RATE || '24000';
      this.ttsRegion = null; // Not used for ElevenLabs
    } else {
      // Microsoft Azure TTS (fallback)
      this.ttsVendor = 'microsoft';
      this.ttsKey = process.env.AZURE_TTS_KEY || process.env.AGORA_TTS_KEY;
      this.ttsRegion = process.env.AZURE_TTS_REGION || process.env.AGORA_TTS_REGION || 'eastus';
      this.ttsVoice = process.env.AGORA_TTS_VOICE || 'en-US-AndrewMultilingualNeural';
    }
    this.ttsProvider = ttsProvider;

    // ASR Configuration
    this.asrLanguage = process.env.AGORA_ASR_LANGUAGE || 'en-US';
    this.asrVendor = process.env.AGORA_ASR_VENDOR || 'ares';

    this._initialized = true;

    console.log('🔧 Agora Conversational AI Service initialized:');
    console.log('   App ID:', this.appId ? '✅ Set' : '❌ Not set');
    console.log('   REST API Key:', this.restApiKey ? '✅ Set' : '❌ Not set');
    console.log('   REST API Secret:', this.restApiSecret ? '✅ Set' : '❌ Not set');
    console.log('   App Certificate:', this.appCertificate ? '✅ Set' : '❌ Not set (needed for token generation)');
    console.log('   LLM Provider:', this.llmProvider.toUpperCase());
    console.log('   LLM API Key:', this.llmApiKey ? '✅ Set' : '❌ Not set');
    console.log('   LLM Model:', this.llmModel);
    console.log('   TTS Provider:', this.ttsProvider.toUpperCase());
    console.log('   TTS API Key:', this.ttsKey ? '✅ Set' : '❌ Not set');
    if (this.ttsProvider === 'elevenlabs') {
      console.log('   ElevenLabs Voice ID:', this.ttsVoice);
    } else {
      console.log('   TTS Voice:', this.ttsVoice);
    }
  }

  /**
   * Generate Basic Auth header for REST API
   * Uses Customer ID:Customer Secret format
   */
  generateBasicAuth() {
    this._initialize();

    if (!this.restApiKey || !this.restApiSecret) {
      throw new Error('Agora REST API Key and Secret are required for Conversational AI API');
    }

    const credentials = `${this.restApiKey}:${this.restApiSecret}`;
    return Buffer.from(credentials).toString('base64');
  }

  /**
   * Generate RTC token for channel access
   * @param {string} channelName - Channel name
   * @param {number|string} uid - User ID (0 for random)
   * @param {number} expireTime - Token expiration time in seconds (default: 3600)
   * @returns {string} RTC token
   */
  generateRTCToken(channelName, uid = 0, expireTime = 3600) {
    this._initialize();

    if (!this.appId || !this.appCertificate) {
      console.warn('⚠️  App ID or Certificate not set. Using empty token (for testing only)');
      console.warn('   Set AGORA_APP_CERTIFICATE in .env for proper token generation');
      return '';
    }

    try {
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expireTime;

      // Generate token using agora-token package
      const token = RtcTokenBuilder.buildTokenWithUid(
        this.appId,
        this.appCertificate,
        channelName,
        Number(uid),
        RtcRole.PUBLISHER,
        privilegeExpiredTs
      );

      return token;
    } catch (error) {
      console.error('❌ Failed to generate RTC token:', error.message);
      console.warn('⚠️  Using empty token (agent may fail to join channel)');
      return '';
    }
  }

  /**
   * Start a Conversational AI agent
   * @param {Object} params - Agent configuration
   * @param {string} params.name - Unique agent identifier
   * @param {string} params.channelName - RTC channel name
   * @param {string} params.userId - User ID to subscribe to
   * @param {number} params.agentRtcUid - Agent's RTC UID (default: 0 for random)
   * @param {Object} params.customConfig - Optional custom LLM/TTS/ASR config
   */
  async startAgent({
    name,
    channelName,
    userId,
    agentRtcUid = 0,
    customConfig = {},
  }) {
    this._initialize();

    if (!this.appId || !this.restApiKey || !this.restApiSecret) {
      throw new Error(
        'Agora App ID, REST API Key, and Secret are required. ' +
        'Please set AGORA_APP_ID, AGORA_REST_API_KEY, and AGORA_REST_API_SECRET in .env'
      );
    }

    try {
      const basicAuth = this.generateBasicAuth();
      const url = `${this.baseURL}/api/conversational-ai-agent/v2/projects/${this.appId}/join`;

      // Generate RTC token
      const token = this.generateRTCToken(channelName, agentRtcUid);

      // Build agent configuration
      const agentConfig = {
        name,
        properties: {
          channel: channelName,
          token: token,
          agent_rtc_uid: String(agentRtcUid),
          remote_rtc_uids: userId ? [String(userId)] : ['*'],
          idle_timeout: 300, // 5 minutes
          enable_string_uid: false,
          ...customConfig.properties,
          llm: {
            url: customConfig.llm?.url || this.llmUrl,
            api_key: customConfig.llm?.api_key || (this.llmProvider === 'gemini' ? '' : this.llmApiKey || ''),
            system_messages: customConfig.llm?.system_messages || [
              ...(this.llmProvider === 'gemini' ? [
                {
                  parts: [
                    {
                      text: 'You are a friendly and helpful customer support agent for SwiftBuy e-commerce platform. ' +
                            'Be friendly, professional, and solution-oriented. Always mention SwiftBuy when appropriate.'
                    }
                  ],
                  role: 'user'
                }
              ] : [
                {
                  role: 'system',
                  content:
                    'You are a friendly and helpful customer support agent for SwiftBuy e-commerce platform. ' +
                    'Be friendly, professional, and solution-oriented. Always mention SwiftBuy when appropriate.',
                }
              ]),
            ],
            max_history: customConfig.llm?.max_history || 32,
            greeting_message: customConfig.llm?.greeting_message || 'Hello! Welcome to SwiftBuy support. How can I assist you today?',
            failure_message: customConfig.llm?.failure_message || 'Please hold on a second, I\'m processing your request.',
            ...(this.llmProvider === 'gemini' ? {
              // Gemini-specific configuration
              style: 'gemini',
              params: {
                model: customConfig.llm?.params?.model || this.llmModel,
                temperature: customConfig.llm?.params?.temperature || 0.7,
                top_p: customConfig.llm?.params?.top_p || 0.95,
                top_k: customConfig.llm?.params?.top_k || 40,
                ...customConfig.llm?.params,
              },
            } : {
              // OpenAI-specific configuration
              params: {
                model: customConfig.llm?.params?.model || this.llmModel,
                temperature: customConfig.llm?.params?.temperature || 0.7,
                max_tokens: customConfig.llm?.params?.max_tokens || 200,
                ...customConfig.llm?.params,
              },
            }),
          },
          tts: {
            vendor: customConfig.tts?.vendor || this.ttsVendor,
            params: {
              ...(this.ttsProvider === 'elevenlabs' ? {
                // ElevenLabs-specific parameters
                key: customConfig.tts?.params?.key || this.ttsKey || '',
                voice_id: customConfig.tts?.params?.voice_id || this.ttsVoice,
                model_id: customConfig.tts?.params?.model_id || this.ttsModelId,
                sample_rate: customConfig.tts?.params?.sample_rate || Number(this.ttsSampleRate),
                stability: customConfig.tts?.params?.stability || 0.5,
                similarity_boost: customConfig.tts?.params?.similarity_boost || 0.75,
              } : {
                // Microsoft Azure TTS parameters
                key: customConfig.tts?.params?.key || this.ttsKey || '',
                region: customConfig.tts?.params?.region || this.ttsRegion,
                voice_name: customConfig.tts?.params?.voice_name || this.ttsVoice,
              }),
              ...customConfig.tts?.params,
            },
          },
          asr: {
            language: customConfig.asr?.language || this.asrLanguage,
            vendor: customConfig.asr?.vendor || this.asrVendor,
            params: customConfig.asr?.params || {},
          },
        },
      };

      console.log('🚀 Starting Agora Conversational AI Agent...');
      console.log('   Agent Name:', name);
      console.log('   Channel:', channelName);
      console.log('   User ID:', userId || 'All users (*)');

      const response = await axios.post(url, agentConfig, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        timeout: 30000,
      });

      console.log('✅ Agora Conversational AI Agent started successfully');
      console.log('   Agent ID:', response.data.agent_id);
      console.log('   Status:', response.data.status);

      return {
        success: true,
        agentId: response.data.agent_id,
        agentName: name,
        channelName,
        status: response.data.status,
        createTs: response.data.create_ts,
      };
    } catch (error) {
      console.error('❌ Failed to start Agora Conversational AI Agent:');
      console.error('   Status:', error.response?.status);
      console.error('   Error:', error.response?.data || error.message);

      if (error.response?.status === 401) {
        throw new Error(
          'Authentication failed. Please check your AGORA_REST_API_KEY and AGORA_REST_API_SECRET in .env'
        );
      }

      throw error;
    }
  }

  /**
   * Stop a Conversational AI agent
   * @param {string} agentId - Agent ID to stop
   */
  async stopAgent(agentId) {
    this._initialize();

    if (!this.appId || !this.restApiKey || !this.restApiSecret) {
      throw new Error('Agora credentials are required');
    }

    try {
      const basicAuth = this.generateBasicAuth();
      const url = `${this.baseURL}/api/conversational-ai-agent/v2/projects/${this.appId}/agents/${agentId}/leave`;

      console.log('🛑 Stopping Agora Conversational AI Agent:', agentId);

      const response = await axios.post(
        url,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${basicAuth}`,
          },
          timeout: 15000,
        }
      );

      console.log('✅ Agora Conversational AI Agent stopped successfully');

      return {
        success: true,
        agentId,
        ...response.data,
      };
    } catch (error) {
      console.error('❌ Failed to stop Agora Conversational AI Agent:');
      console.error('   Status:', error.response?.status);
      console.error('   Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Query agent status
   * @param {string} agentId - Agent ID to query
   */
  async getAgentStatus(agentId) {
    this._initialize();

    if (!this.appId || !this.restApiKey || !this.restApiSecret) {
      throw new Error('Agora credentials are required');
    }

    try {
      const basicAuth = this.generateBasicAuth();
      const url = `${this.baseURL}/api/conversational-ai-agent/v2/projects/${this.appId}/agents/${agentId}`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        timeout: 10000,
      });

      return {
        success: true,
        agentId,
        ...response.data,
      };
    } catch (error) {
      console.error('❌ Failed to query Agora Conversational AI Agent status:');
      console.error('   Status:', error.response?.status);
      console.error('   Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * List all agents for the project
   */
  async listAgents() {
    this._initialize();

    if (!this.appId || !this.restApiKey || !this.restApiSecret) {
      throw new Error('Agora credentials are required');
    }

    try {
      const basicAuth = this.generateBasicAuth();
      const url = `${this.baseURL}/api/conversational-ai-agent/v2/projects/${this.appId}/agents`;

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${basicAuth}`,
        },
        timeout: 10000,
      });

      return {
        success: true,
        agents: response.data || [],
      };
    } catch (error) {
      console.error('❌ Failed to list Agora Conversational AI Agents:');
      console.error('   Status:', error.response?.status);
      console.error('   Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new AgoraConversationalAIService();

