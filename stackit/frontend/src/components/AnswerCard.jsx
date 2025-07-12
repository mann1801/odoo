import React, { useState } from 'react';
import VotingBar from './VotingBar';
import AcceptAnswerButton from './AcceptAnswerButton';
import CommentList from './CommentList';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AnswerCard({ answer, showQuestion, onVoted, onAccepted, questionAuthorId }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);

  // Optimistic voting state
  const [localVote, setLocalVote] = useState(answer.userVote);
  const [localVoteCount, setLocalVoteCount] = useState(answer.voteCount || 0);
  const [voting, setVoting] = useState(false);

  // Dummy shares count for now (replace with real data if available)
  const sharesCount = 0;

  // Optimistic vote logic
  const handleVote = async (type) => {
    if (!user) {
      alert('Please log in to vote!');
      return;
    }
    if (voting) return;
    setVoting(true);
    let newVote = localVote;
    let newCount = localVoteCount;
    // Calculate new vote state and count
    if (type === 'upvote') {
      if (localVote === 'upvote') {
        newVote = null;
        newCount -= 1;
      } else if (localVote === 'downvote') {
        newVote = 'upvote';
        newCount += 2;
      } else {
        newVote = 'upvote';
        newCount += 1;
      }
    } else if (type === 'downvote') {
      if (localVote === 'downvote') {
        newVote = null;
        newCount += 1;
      } else if (localVote === 'upvote') {
        newVote = 'downvote';
        newCount -= 2;
      } else {
        newVote = 'downvote';
        newCount -= 1;
      }
    }
    setLocalVote(newVote);
    setLocalVoteCount(newCount);
    try {
      await api.post(`/answers/${answer._id}/vote`, { voteType: type });
      // Do NOT call onVoted() here, let the optimistic UI handle it
    } catch (err) {
      // Revert UI on error
      setLocalVote(answer.userVote);
      setLocalVoteCount(answer.voteCount || 0);
      alert(err.response?.data?.message || 'Failed to vote.');
    } finally {
      setVoting(false);
    }
  };

  return (
    <div className={`bg-gray-50 p-4 rounded shadow mb-4 ${answer.isAccepted ? 'border-2 border-green-200' : ''}`}>
      {showQuestion && answer.question && (
        <div className="text-sm text-primary-700 font-semibold mb-1">Q: {answer.question.title}</div>
      )}
      <VotingBar
        votes={localVoteCount}
        commentsCount={answer.commentCount || (answer.comments ? answer.comments.length : 0)}
        sharesCount={sharesCount}
        userVote={localVote}
        onUpvote={() => handleVote('upvote')}
        onDownvote={() => handleVote('downvote')}
        onCommentClick={() => setShowComments((v) => !v)}
        onShareClick={() => {}}
        showComments={showComments}
      >
        <CommentList
          comments={answer.comments || []}
          answerId={answer._id}
          onCommented={() => onVoted && onVoted()}
        />
      </VotingBar>
      <div className="prose max-w-none mt-4" dangerouslySetInnerHTML={{ __html: answer.content }} />
      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
        <div>
          Answered by <span className="font-medium">{answer.author?.username || 'anonymous'}</span> • {new Date(answer.createdAt).toLocaleString()}
        </div>
        <div className="flex items-center gap-2">
          {answer.isAccepted && (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
              ✓ Accepted
            </div>
          )}
          <AcceptAnswerButton
            answer={answer}
            questionAuthorId={questionAuthorId}
            onAccepted={onAccepted}
          />
        </div>
      </div>
    </div>
  );
} 