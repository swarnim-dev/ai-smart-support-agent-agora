const knowledgeBase = {
  greeting: [
    'Hello! Welcome to SwiftBuy support. How can I assist you today?',
    'Hi there! Thanks for reaching out to SwiftBuy. What can I help you with?',
    'Welcome to SwiftBuy customer support! I\'m here to help. What do you need assistance with?'
  ],
  goodbye: [
    'Thank you for contacting SwiftBuy! Have a wonderful day!',
    'Thanks for choosing SwiftBuy! If you need anything else, feel free to reach out.',
    'We appreciate your business at SwiftBuy! Take care!'
  ],
  help: [
    'I can help you with orders, returns, shipping, payments, product inquiries, or account issues. What do you need assistance with?',
    'At SwiftBuy, I can assist with order tracking, returns and refunds, shipping questions, payment issues, or any other concerns. How can I help?',
    'I\'m here to help with all your SwiftBuy needs - orders, shipping, returns, payments, and more. What can I assist you with today?'
  ],
  billing: [
    'For billing and payment inquiries at SwiftBuy, I can help you check your account, update payment methods, or resolve billing issues. What specific question do you have?',
    'I can assist with SwiftBuy billing questions. Are you looking to update your payment method, check a charge, or resolve a billing issue?',
    'For SwiftBuy payment and billing help, please share your order number or account email, and I\'ll assist you right away.'
  ],
  technical: [
    'I can help troubleshoot SwiftBuy website or app issues. Can you describe what problem you\'re experiencing?',
    'For technical issues with SwiftBuy, try clearing your browser cache or restarting the app. If the problem persists, let me know the details.',
    'I\'m here to help with SwiftBuy technical issues. What specific problem are you encountering?'
  ],
  order: [
    'I\'d be happy to help with your SwiftBuy order! Can you provide your order number or the email address associated with your account?',
    'For SwiftBuy order inquiries, please share your order number so I can check the status and assist you.',
    'I can help you track your SwiftBuy order, check status, or answer questions about your purchase. What\'s your order number?'
  ],
  return: [
    'I can assist with SwiftBuy returns and refunds. Our return policy allows returns within 30 days of delivery. Would you like to initiate a return?',
    'For SwiftBuy returns, items can be returned within 30 days in original condition. Can you share your order number to start the return process?',
    'I\'m here to help with SwiftBuy returns. What item would you like to return, and do you have your order number?'
  ],
  shipping: [
    'SwiftBuy offers fast shipping! Standard is 3-5 business days, express is 1-2 business days. Can you share your order number to check shipping status?',
    'For SwiftBuy shipping inquiries, I can track your package. Please provide your order number or tracking number.',
    'I can help check your SwiftBuy order shipping status. What\'s your order number?'
  ],
  default: [
    'Thank you for contacting SwiftBuy support! I\'m here to help with orders, returns, shipping, payments, or any questions. How can I assist you?',
    'I understand. Let me help you with that. Can you provide more details about what you need assistance with at SwiftBuy?',
    'I\'m here to help with all your SwiftBuy needs. Could you tell me more about what you\'re looking for?'
  ],
};

export const lookupKB = (intent) => {
  return knowledgeBase[intent] || knowledgeBase.default;
};

export const getRandomResponse = (intent) => {
  const responses = lookupKB(intent);
  return responses[Math.floor(Math.random() * responses.length)];
};

