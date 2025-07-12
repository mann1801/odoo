import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function AcceptAnswerButton({ answer, questionAuthorId, onAccepted }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Check if current user can accept this answer
  const canAccept = user && (
    user._id === questionAuthorId || 
    user.role === 'admin'
  );

  const handleAccept = async () => {
    if (!canAccept) {
      alert('Only the question author can accept answers');
      return;
    }

    setLoading(true);
    try {
      await api.put(`/answers/${answer._id}/accept`);
      if (onAccepted) onAccepted();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to accept answer. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!canAccept) {
    return null;
  }

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className={`
        inline-flex items-center px-3 py-1 rounded text-sm font-medium transition-colors duration-200
        ${answer.isAccepted 
          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={answer.isAccepted ? 'Unaccept answer' : 'Accept answer'}
    >
      {loading ? (
        <span className="animate-spin mr-1">⟳</span>
      ) : (
        <span className="mr-1">{answer.isAccepted ? '✓' : '○'}</span>
      )}
      {answer.isAccepted ? 'Accepted' : 'Accept'}
    </button>
  );
} 