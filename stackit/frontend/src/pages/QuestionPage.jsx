import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AnswerCard from '../components/AnswerCard';
import AnswerForm from '../components/AnswerForm';
import VoteButtons from '../components/VoteButtons';
import TagList from '../components/TagList';
import api from '../api';

export default function QuestionPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestionAndAnswers();
  }, [id]);

  const fetchQuestionAndAnswers = async () => {
    try {
      setLoading(true);
      const [questionRes, answersRes] = await Promise.all([
        api.get(`/questions/${id}`),
        api.get(`/questions/${id}/answers`)
      ]);
      
      setQuestion(questionRes.data.data.question);
      setAnswers(answersRes.data.data.answers);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load question');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmitted = (newAnswer) => {
    setAnswers(prev => [newAnswer, ...prev]);
  };

  const handleAnswerAccepted = () => {
    // Refresh the answers to show the updated acceptance status
    fetchQuestionAndAnswers();
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-white p-6 rounded shadow">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || 'Question not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10">
      {/* Question */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <h1 className="text-2xl font-bold mb-2">{question.title}</h1>
        <div className="mb-2 text-gray-600 text-sm">
          Asked by <span className="font-medium">{question.author?.username}</span> • {new Date(question.createdAt).toLocaleString()}
        </div>
        <TagList tags={question.tags} />
        <div className="mt-4 flex gap-4 items-start">
          <VoteButtons 
            votes={question.voteCount} 
            questionId={question._id}
            onVoted={fetchQuestionAndAnswers}
            userVote={question.userVote}
          />
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: question.description }} />
        </div>
      </div>

      {/* Answers Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>
        {answers.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded text-center">
            <p className="text-gray-600">No answers yet. Be the first to answer this question!</p>
          </div>
        ) : (
          answers.map(answer => (
            <AnswerCard 
              key={answer._id} 
              answer={answer}
              onVoted={fetchQuestionAndAnswers}
              onAccepted={handleAnswerAccepted}
              questionAuthorId={question.author?._id}
            />
          ))
        )}
      </div>

      {/* Answer Form */}
      <AnswerForm 
        questionId={question._id} 
        onAnswerSubmitted={handleAnswerSubmitted}
      />
    </div>
  );
}