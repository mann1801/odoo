import React from 'react';

export default function VotingBar({
  votes = 0,
  commentsCount = 0,
  sharesCount = 0,
  userVote = null,
  onUpvote,
  onDownvote,
  onCommentClick,
  onShareClick,
  showComments = false,
  children,
}) {
  // Format large numbers (e.g., 4711 -> 4.7K)
  const formatCount = (n) => n > 999 ? (n/1000).toFixed(1).replace(/\.0$/, '') + 'K' : n;

  return (
    <>
      <div className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg">
        {/* Upvote */}
        <button
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors duration-150 ${userVote === 'upvote' ? 'bg-blue-800 text-blue-300' : 'hover:bg-gray-800'}`}
          onClick={onUpvote}
          title="Upvote"
        >
          <span className="text-xl">▲</span>
          <span className="font-semibold">Upvote</span>
          <span className="ml-1">· {formatCount(votes)}</span>
        </button>
        {/* Downvote */}
        <button
          className={`flex items-center px-2 py-1 rounded transition-colors duration-150 ${userVote === 'downvote' ? 'bg-blue-800 text-blue-300' : 'hover:bg-gray-800'}`}
          onClick={onDownvote}
          title="Downvote"
        >
          <span className="text-xl">▼</span>
        </button>
        {/* Comment */}
        <button
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors duration-150 ${showComments ? 'border border-blue-400' : 'hover:bg-gray-800'}`}
          onClick={onCommentClick}
          title="Comments"
        >
          <span className="text-lg">💬</span>
          <span>{commentsCount}</span>
        </button>
        {/* Share/Refresh */}
        <button
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-800 transition-colors duration-150"
          onClick={onShareClick}
          title="Share"
        >
          <span className="text-lg">🔄</span>
          <span>{sharesCount}</span>
        </button>
      </div>
      {/* Comment section below */}
      <div>
        {showComments && (
          <div className="mt-2">{children}</div>
        )}
      </div>
    </>
  );
} 