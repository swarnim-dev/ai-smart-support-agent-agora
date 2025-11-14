const knowledgeBase = {
  greeting: ['Hello! How can I help you today?', 'Hi there! What can I assist you with?'],
  goodbye: ['Goodbye! Have a great day!', 'Thanks for reaching out. Take care!'],
  help: ['I can help you with account issues, billing questions, or technical support. What do you need?'],
  billing: ['For billing inquiries, please check your account dashboard or contact our billing team at billing@example.com.'],
  technical: ['For technical issues, try clearing your cache or restarting the application. If the problem persists, let me know the details.'],
  default: ['I understand. Let me help you with that. Can you provide more details?'],
};

export const lookupKB = (intent) => {
  return knowledgeBase[intent] || knowledgeBase.default;
};

export const getRandomResponse = (intent) => {
  const responses = lookupKB(intent);
  return responses[Math.floor(Math.random() * responses.length)];
};

