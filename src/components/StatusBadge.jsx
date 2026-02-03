// components/StatusBadge.jsx
import React from 'react';

const StatusBadge = ({ status }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'pending_review':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      case 'not_submitted':
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'pending_review':
        return 'Pending Review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'not_submitted':
        return 'Not Submitted';
      default:
        return status;
    }
  };

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusStyle()}`}>
      {getStatusLabel()}
    </span>
  );
};

export default StatusBadge;