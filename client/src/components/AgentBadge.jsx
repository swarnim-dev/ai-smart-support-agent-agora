import React from 'react';

const AgentBadge = ({ name = 'AI Agent' }) => {
  return (
    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-semibold border border-blue-200">
      <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
      {name}
    </div>
  );
};

export default AgentBadge;

