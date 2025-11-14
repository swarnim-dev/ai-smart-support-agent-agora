import React from 'react';

const AgentBadge = ({ name = 'AI Agent' }) => {
  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
      <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
      {name}
    </div>
  );
};

export default AgentBadge;

