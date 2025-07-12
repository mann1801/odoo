import React from 'react';
import { Link } from 'react-router-dom';
import TagList from './TagList';
import VoteButtons from './VoteButtons';

export default function QuestionCard({ question }) {
  return (
    <div className="bg-white p-5 rounded shadow flex gap-4 items-start hover:shadow-lg transition">
      <div className="flex flex-col items-center mr-4">
        <VoteButtons votes={question.voteCount} vertical />
        <div className="text-xs text-gray-500 mt-2">{question.answerCount} answers</div>
      </div>
      <div className="flex-1">
        <Link to={`/questions/${question._id}`} className="text-lg font-semibold hover:underline">
          {question.title}
        </Link>
        <div className="text-gray-600 text-sm mt-1 mb-2">
          Asked by <span className="font-medium">{question.author?.username || 'anonymous'}</span> • {new Date(question.createdAt).toLocaleDateString()}
        </div>
        <TagList tags={question.tags} editable={false} />
        <div className="mt-2 text-gray-700 line-clamp-2 prose max-w-none" dangerouslySetInnerHTML={{ __html: question.description }} />
      </div>
    </div>
  );
} 