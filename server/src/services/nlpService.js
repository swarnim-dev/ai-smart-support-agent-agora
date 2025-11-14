import { getRandomResponse } from './kbService.js';

const detectIntent = (text) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.match(/\b(hi|hello|hey|greetings)\b/)) {
    return { intent: 'greeting', confidence: 0.9 };
  }
  if (lowerText.match(/\b(bye|goodbye|see you|farewell)\b/)) {
    return { intent: 'goodbye', confidence: 0.9 };
  }
  if (lowerText.match(/\b(help|support|assist)\b/)) {
    return { intent: 'help', confidence: 0.85 };
  }
  if (lowerText.match(/\b(bill|billing|payment|charge|invoice)\b/)) {
    return { intent: 'billing', confidence: 0.85 };
  }
  if (lowerText.match(/\b(error|bug|issue|problem|broken|not working)\b/)) {
    return { intent: 'technical', confidence: 0.8 };
  }
  
  return { intent: 'default', confidence: 0.5 };
};

export const processMessage = async (userMessage) => {
  const { intent, confidence } = detectIntent(userMessage);
  const responseText = getRandomResponse(intent);
  
  return {
    text: responseText,
    intent,
    confidence,
  };
};

