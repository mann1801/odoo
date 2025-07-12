import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function VoteButtons({ votes = 0, vertical, questionId, answerId, onVoted, userVote = null }) {
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleVote = async (type) => {
    if (!isAuthenticated) {
      alert('Please log in to vote!');
      return;
    }

    // Check if user is voting on their own content
    if (questionId && user?.username) {
      // For questions, we'd need to check if the user is the author
      // This would require passing the question author info
    }

    setLoading(true);
    try {
      if (questionId) {
        await api.post(`/questions/${questionId}/vote`, { voteType: type });
      } else if (answerId) {
        await api.post(`/answers/${answerId}/vote`, { voteType: type });
      }
      if (onVoted) onVoted();
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to vote. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getVoteButtonClass = (voteType) => {
    const baseClass = "text-xl transition-colors duration-200";
    const isActive = userVote === voteType;
    
    if (isActive) {
      return `${baseClass} text-primary-600 cursor-pointer`;
    }
    
    return `${baseClass} text-gray-400 hover:text-primary-600 cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : ''}`;
  };

  return (
    <div className={vertical ? 'flex flex-col items-center' : 'flex items-center gap-2'}>
      <button 
        className={getVoteButtonClass('upvote')}
        onClick={() => !loading && handleVote('upvote')}
        disabled={loading}
        title="Upvote"
      >
        ▲
      </button>
      <div className={`font-semibold text-gray-700 ${vertical ? 'my-1' : ''}`}>
        {votes}
      </div>
      <button 
        className={getVoteButtonClass('downvote')}
        onClick={() => !loading && handleVote('downvote')}
        disabled={loading}
        title="Downvote"
      >
        ▼
      </button>
    </div>
  );
}