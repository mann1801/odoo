import React, { useState } from 'react';
import RichTextEditor from './RichTextEditor';
import { useAuth } from '../context/AuthContext';
import api from '../api';

export default function AnswerForm({ questionId, onAnswerSubmitted }) {
  const { isAuthenticated, user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('You must be logged in to post an answer');
      return;
    }

    if (!content.trim()) {
      setError('Answer content is required');
      return;
    }

    if (content.trim().length < 10) {
      setError('Answer must be at least 10 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/questions/${questionId}/answers`, {
        content: content.trim()
      });

      setContent('');
      if (onAnswerSubmitted) {
        onAnswerSubmitted(response.data.data.answer);
      }
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors[0].msg);
      } else {
        setError('Failed to submit answer. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-white p-6 rounded shadow">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold mb-2">Post Your Answer</h3>
          <p className="text-gray-600 mb-4">You must be logged in to post an answer</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Your Answer</h3>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Write your answer
          </label>
          <RichTextEditor 
            value={content} 
            onChange={setContent}
            placeholder="Provide a detailed answer to help others understand the solution..."
          />
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {content.length} characters
          </div>
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      </form>
    </div>
  );
} 
