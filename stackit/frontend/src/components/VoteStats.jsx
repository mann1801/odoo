import React from 'react';

export default function VoteStats({ votes, totalVotes, userVote }) {
  const upvotePercentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  
  return (
    <div className="text-xs text-gray-500 space-y-1">
      <div className="flex items-center gap-2">
        <span className="font-medium">{votes}</span>
        <span>votes</span>
        {userVote && (
          <span className="text-primary-600">
            (you {userVote === 'upvote' ? 'upvoted' : 'downvoted'})
          </span>
        )}
      </div>
      {totalVotes > 0 && (
        <div className="flex items-center gap-1">
          <div className="w-16 bg-gray-200 rounded-full h-1">
            <div 
              className="bg-primary-600 h-1 rounded-full" 
              style={{ width: `${upvotePercentage}%` }}
            ></div>
          </div>
          <span>{upvotePercentage}% positive</span>
        </div>
      )}
    </div>
  );
} 