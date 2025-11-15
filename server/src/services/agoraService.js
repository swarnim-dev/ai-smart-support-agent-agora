import axios from 'axios';
import crypto from 'crypto';

class AgoraChatService {
  constructor() {
    this._initialized = false;
    this.lastOpenAIRequest = 0;
    this.minRequestInterval = 2000;
    this.requestQueue = [];
    this.processingQueue = false;
  }

  _initialize() {
    if (this._initialized) return;
    
    this.appId = process.env.AGORA_APP_ID;
    
    this.restApiKey = process.env.AGORA_REST_API_KEY;
    this.restApiSecret = process.env.AGORA_REST_API_SECRET;
    
    let appKey = process.env.AGORA_APP_KEY || '';
    appKey = appKey.replace(/^["']|["']$/g, '');
    if (appKey && !appKey.includes('#')) {
      const orgName = process.env.AGORA_ORG_NAME;
      const appName = process.env.AGORA_APP_NAME;
      if (orgName && appName) {
        appKey = `${orgName}#${appName}`;
      }
    }
    this.appKey = appKey;
    
    if (this.appKey && this.appKey.includes('#')) {
      const parts = this.appKey.split('#');
      this.orgName = parts[0];
      this.appName = parts[1];
    } else {
      this.orgName = process.env.AGORA_ORG_NAME;
      this.appName = process.env.AGORA_APP_NAME;
    }
    
    let baseURL = process.env.AGORA_REST_API_URL || 'https://api.agora.io';
    if (baseURL && !baseURL.startsWith('http')) {
      baseURL = `https://${baseURL}`;
    }
    this.baseURL = baseURL;
    
    let chatBaseURL = process.env.AGORA_CHAT_API_URL || process.env.AGORA_REST_API_URL;
    if (!chatBaseURL) {
      chatBaseURL = 'https://api.agora.io';
    } else if (chatBaseURL && !chatBaseURL.startsWith('http')) {
      chatBaseURL = `https://${chatBaseURL}`;
    }
    this.chatBaseURL = chatBaseURL;
    
    this.agentUserId = process.env.AGORA_AGENT_USER_ID || 'swiftbuy-support-agent';
    this._initialized = true;
    
    console.log('🔧 AgoraService initialized:');
    console.log('   appId:', this.appId ? '✅ Set' : '❌ Not set');
    console.log('   restApiKey:', this.restApiKey ? '✅ Set' : '❌ Not set');
    console.log('   restApiSecret:', this.restApiSecret ? '✅ Set' : '❌ Not set');
    console.log('   appKey:', this.appKey ? `✅ Set (length: ${this.appKey.length})` : '❌ Not set');
    console.log('   orgName:', this.orgName || 'Not set');
    console.log('   appName:', this.appName || 'Not set');
    console.log('   baseURL (Conversational AI):', this.baseURL);
    console.log('   chatBaseURL (Chat API):', this.chatBaseURL);
  }

  generateBasicAuth() {
    this._initialize();
    
    if (!this.appKey) {
      throw new Error('Agora AppKey is not configured');
    }

    const credentials = this.appKey;
    return Buffer.from(credentials).toString('base64');
  }

  generateRestAPIAuth() {
    this._initialize();
    
    if (!this.restApiKey || !this.restApiSecret) {
      throw new Error('Agora Customer ID/Secret (REST API Key/Secret) is not configured');
    }

    const plainCredential = `${this.restApiKey}:${this.restApiSecret}`;
    const encodedCredential = Buffer.from(plainCredential).toString('base64');
    return encodedCredential;
  }

  async getAccessToken() {
    this._initialize();
    try {
      const basicAuth = this.generateBasicAuth();
      const url = `${this.baseURL}/${this.orgName}/${this.appName}/token`;
      
      const response = await axios.post(
        url,
        {
          grant_type: 'client_credentials',
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`,
          },
          timeout: 10000,
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Failed to get Agora access token:', error.response?.data || error.message);
      throw error;
    }
  }

  async sendMessage(toUserId, messageText, conversationContext = []) {
    this._initialize();
    try {
      if (!this.appKey || !this.orgName || !this.appName) {
        throw new Error('Agora Chat AppKey is not configured. Please set AGORA_APP_KEY (orgName#appName) in .env');
      }

      const basicAuth = this.generateBasicAuth();
      const url = `${this.chatBaseURL}/${this.orgName}/${this.appName}/messages`;

      const payload = {
        target_type: 'users',
        target: [toUserId],
        msg: {
          type: 'txt',
          msg: messageText,
        },
        from: this.agentUserId,
        ext: {
          conversationContext: JSON.stringify(conversationContext),
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        timeout: 10000,
      });

      return {
        success: true,
        messageId: response.data.data?.id,
        timestamp: response.data.data?.timestamp,
      };
    } catch (error) {
      console.error('Agora Chat API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async getConversationalAIResponse(userMessage, conversationHistory = [], mode = 'text') {
    this._initialize();
    
    if (mode === 'voice') {
      return await this.getVoiceAIResponse(userMessage, conversationHistory);
    }
    
    return await this.getTextAIResponse(userMessage, conversationHistory);
  }

  async getTextAIResponse(userMessage, conversationHistory = []) {
    this._initialize();
    
    if (!this.appKey || !this.orgName || !this.appName) {
      throw new Error('Agora Chat AppKey (orgName#appName) is not configured');
    }

    try {
      const basicAuth = this.generateBasicAuth();
      const url = `${this.chatBaseURL}/${this.orgName}/${this.appName}/messages`;
      
      console.log('💬 Sending message via Agora Chat API:', url);
      console.log('🔑 Using AppKey for authentication');
      console.log('   AppKey:', this.appKey ? `${this.appKey.substring(0, 15)}...` : 'Not set');
      console.log('   OrgName:', this.orgName);
      console.log('   AppName:', this.appName);
      
      const payload = {
        target_type: 'users',
        target: [this.agentUserId],
        msg: {
          type: 'txt',
          msg: userMessage,
        },
        from: 'customer',
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        timeout: 10000,
      });

      console.log('✅ Agora Chat message sent successfully');
      
      const responseText = this.generateContextualResponse(userMessage, conversationHistory);
      return responseText;
    } catch (error) {
      console.error('❌ Agora Chat API Error:', error.response?.data || error.message);
      console.error('   Status:', error.response?.status);
      console.error('   URL:', error.config?.url);
      
      if (error.response?.status === 401) {
        console.error('⚠️  Authentication failed. Check your AppKey in .env');
        console.error('   Make sure AGORA_APP_KEY (format: orgName#appName) is set correctly');
        console.error('   Or set AGORA_ORG_NAME and AGORA_APP_NAME separately');
        console.error('   Current AppKey:', this.appKey || 'Not set');
      }
      
      const responseText = this.generateContextualResponse(userMessage, conversationHistory);
      return responseText;
    }
  }

  generateContextualResponse(userMessage, conversationHistory) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('purchase')) {
      return 'I\'d be happy to help with your SwiftBuy order! Can you provide your order number or the email address associated with your account?';
    }
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return 'I can assist with SwiftBuy returns and refunds. Our return policy allows returns within 30 days of delivery. Would you like to initiate a return?';
    }
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return 'SwiftBuy offers fast shipping! Standard is 3-5 business days, express is 1-2 business days. Can you share your order number to check shipping status?';
    }
    if (lowerMessage.match(/\b(hi|hello|hey)\b/)) {
      return 'Hello! Welcome to SwiftBuy support. How can I assist you today?';
    }
    
    return 'Thank you for contacting SwiftBuy support! I\'m here to help with orders, returns, shipping, payments, or any questions. How can I assist you?';
  }

  async getVoiceAIResponse(userMessage, conversationHistory = []) {
    this._initialize();
    
    if (!this.restApiKey || !this.restApiSecret || !this.appId) {
      throw new Error('Agora REST API credentials not configured');
    }

    try {
      const basicAuth = this.generateRestAPIAuth();
      const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${this.appId}/join`;
      
      const agentName = `swiftbuy-voice-agent-${Date.now()}`;
      const channelName = `swiftbuy-channel-${Date.now()}`;
      
      const payload = {
        name: agentName,
        properties: {
          channel: channelName,
          token: process.env.AGORA_RTC_TOKEN || '',
          agent_rtc_uid: '1001',
          remote_rtc_uids: ['*'],
          idle_timeout: 60,
          llm: {
            url: 'https://api.openai.com/v1/chat/completions',
            api_key: process.env.OPENAI_API_KEY || '',
            system_messages: [
              {
                role: 'system',
                content: 'You are a friendly and helpful customer support agent for SwiftBuy e-commerce platform. Be friendly, professional, and solution-oriented. Always mention SwiftBuy when appropriate.',
              },
            ],
            params: {
              model: 'gpt-3.5-turbo',
            },
            max_history: 10,
          },
          tts: {
            vendor: 'microsoft',
            params: {
              key: process.env.AZURE_TTS_KEY || '',
              region: process.env.AZURE_TTS_REGION || 'eastus',
              voice_name: 'en-US-AndrewMultilingualNeural',
            },
          },
          asr: {
            language: 'en-US',
            vendor: 'ares',
          },
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        timeout: 15000,
      });

      console.log('✅ Agora Voice Agent created:', response.data);
      return {
        agentId: response.data.agent_id,
        channelName,
        status: response.data.status,
      };
    } catch (error) {
      console.error('❌ Agora Voice AI Error:', error.response?.data || error.message);
      throw error;
    }
  }

  async startVoiceAgent(channelName, userId) {
    this._initialize();
    
    if (!this.restApiKey || !this.restApiSecret || !this.appId) {
      throw new Error('Agora REST API credentials not configured');
    }

    try {
      const basicAuth = this.generateRestAPIAuth();
      const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${this.appId}/join`;
      
      const agentName = `swiftbuy-agent-${userId}-${Date.now()}`;
      
      const payload = {
        name: agentName,
        properties: {
          channel: channelName,
          token: process.env.AGORA_RTC_TOKEN || '',
          agent_rtc_uid: '1001',
          remote_rtc_uids: [userId],
          idle_timeout: 300,
          llm: {
            url: 'https://api.openai.com/v1/chat/completions',
            api_key: process.env.OPENAI_API_KEY || '',
            system_messages: [
              {
                role: 'system',
                content: 'You are a friendly and helpful customer support agent for SwiftBuy e-commerce platform. Be friendly, professional, and solution-oriented. Always mention SwiftBuy when appropriate.',
              },
            ],
            params: {
              model: 'gpt-3.5-turbo',
            },
            max_history: 10,
          },
          tts: {
            vendor: 'microsoft',
            params: {
              key: process.env.AZURE_TTS_KEY || '',
              region: process.env.AZURE_TTS_REGION || 'eastus',
              voice_name: 'en-US-AndrewMultilingualNeural',
            },
          },
          asr: {
            language: 'en-US',
            vendor: 'ares',
          },
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        timeout: 15000,
      });

      return {
        agentId: response.data.agent_id,
        agentName,
        channelName,
        status: response.data.status,
      };
    } catch (error) {
      console.error('❌ Failed to start Agora Voice Agent:', error.response?.data || error.message);
      throw error;
    }
  }

  async stopVoiceAgent(agentId) {
    this._initialize();
    
    if (!this.restApiKey || !this.restApiSecret || !this.appId) {
      throw new Error('Agora REST API credentials not configured');
    }

    try {
      const basicAuth = this.generateRestAPIAuth();
      const url = `https://api.agora.io/api/conversational-ai-agent/v2/projects/${this.appId}/agents/${agentId}/leave`;
      
      const response = await axios.post(url, {}, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`,
        },
        timeout: 10000,
      });

      return response.data;
    } catch (error) {
      console.error('❌ Failed to stop Agora Voice Agent:', error.response?.data || error.message);
      throw error;
    }
  }

  async callOpenAI(messagesOrPrompt, retryCount = 0) {
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastOpenAIRequest;
    
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before next OpenAI request...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    const maxRetries = 3;
    const baseDelay = 1000;

    try {
      this.lastOpenAIRequest = Date.now();
      console.log('🤖 Calling OpenAI API...');
      
      let messages;
      if (Array.isArray(messagesOrPrompt)) {
        messages = messagesOrPrompt;
      } else {
        messages = [
          {
            role: 'system',
            content: 'You are a helpful customer support agent for SwiftBuy e-commerce platform. Be friendly, professional, and solution-oriented. Always mention SwiftBuy when appropriate.',
          },
          {
            role: 'user',
            content: messagesOrPrompt,
          },
        ];
      }
      
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages,
          max_tokens: 200,
          temperature: 0.7,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`,
          },
          timeout: 15000,
        }
      );

      const aiResponse = response.data.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response from OpenAI');
      }
      
      console.log('✅ OpenAI API response received');
      return aiResponse;
    } catch (error) {
      if (error.response?.status === 429 && retryCount < maxRetries) {
        const retryAfter = error.response?.headers['retry-after'] 
          ? parseInt(error.response.headers['retry-after']) * 1000 
          : baseDelay * Math.pow(2, retryCount);
        
        console.warn(`⚠️  OpenAI rate limit hit. Retrying after ${retryAfter}ms (attempt ${retryCount + 1}/${maxRetries})...`);
        
        await new Promise(resolve => setTimeout(resolve, retryAfter));
        return await this.callOpenAI(messagesOrPrompt, retryCount + 1);
      }
      
      if (error.response?.status === 429) {
        console.error('❌ OpenAI API Rate Limit Error: Too many requests. Please wait before trying again.');
        throw new Error('OpenAI rate limit exceeded. Please try again in a moment.');
      }
      
      console.error('❌ OpenAI API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  getFallbackResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('order') || lowerMessage.includes('purchase')) {
      return "I'd be happy to help you with your SwiftBuy order! Can you please provide your order number or the email address associated with your account?";
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return "I can assist you with returns and refunds at SwiftBuy. Our return policy allows returns within 30 days of delivery. Would you like to initiate a return for a specific order?";
    }
    
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return "SwiftBuy offers fast and reliable shipping! Standard shipping is 3-5 business days, and we also offer express shipping (1-2 business days). Can you share your order number so I can check the shipping status?";
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('billing')) {
      return "For payment and billing inquiries, I can help you check your account, update payment methods, or resolve billing issues. What specific payment question do you have?";
    }
    
    return "Thank you for contacting SwiftBuy support! I'm here to help you with orders, returns, shipping, payments, or any other questions. How can I assist you today?";
  }
}

export default new AgoraChatService();

