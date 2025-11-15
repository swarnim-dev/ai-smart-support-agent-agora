import { getRandomResponse } from './kbService.js';

const detectIntent = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/\b(hi|hello|hey|greetings|good morning|good afternoon)\b/)) {
    return { intent: 'greeting', confidence: 0.9 };
  }
  if (lowerText.match(/\b(bye|goodbye|see you|farewell|thanks|thank you)\b/)) {
    return { intent: 'goodbye', confidence: 0.9 };
  }
  if (lowerText.match(/\b(order|purchase|bought|buy|ordered)\b/)) {
    return { intent: 'order', confidence: 0.9 };
  }
  if (lowerText.match(/\b(return|refund|exchange|send back)\b/)) {
    return { intent: 'return', confidence: 0.9 };
  }
  if (lowerText.match(/\b(shipping|delivery|track|tracking|when will|arrive)\b/)) {
    return { intent: 'shipping', confidence: 0.9 };
  }
  if (lowerText.match(/\b(help|support|assist|question|problem)\b/)) {
    return { intent: 'help', confidence: 0.85 };
  }
  if (lowerText.match(/\b(bill|billing|payment|charge|invoice|pay|paid)\b/)) {
    return { intent: 'billing', confidence: 0.85 };
  }
  if (lowerText.match(/\b(error|bug|issue|problem|broken|not working|technical)\b/)) {
    return { intent: 'technical', confidence: 0.8 };
  }
  
  return { intent: 'default', confidence: 0.5 };
};

export const processMessage = async (userMessage, conversationHistory = []) => {
  const { intent, confidence } = detectIntent(userMessage);
  
  console.log('📚 Using knowledge base for response');
  
  const responseText = getRandomResponse(intent);
  
  return {
    text: responseText,
    intent,
    confidence,
    source: 'knowledge-base',
  };
};

