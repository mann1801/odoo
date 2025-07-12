import React, { useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function CommentList({ comments = [], answerId, onCommented }) {
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!input) return;
    try {
      await api.post(`/answers/${answerId}/comments`, { content: input });
      setInput('');
      if (onCommented) onCommented();
    } catch (err) {
      // Optionally show error
    }
  };

  return (
    <div className="mt-4 border-t pt-2">
      <h4 className="text-xs text-gray-500 mb-1">Comments</h4>
      <ul className="space-y-1">
        {comments.map((c, i) => (
          <li key={i} className="text-xs text-gray-700 bg-gray-100 rounded px-2 py-1">
            <span className="font-semibold">{c.author?.username || 'anonymous'}:</span> {c.content}
          </li>
        ))}
      </ul>
      {isAuthenticated && (
        <form onSubmit={handleAdd} className="flex gap-2 mt-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            className="border px-2 py-1 rounded text-xs flex-1"
            placeholder="Add a comment"
          />
          <button type="submit" className="text-primary-700 font-bold">Post</button>
        </form>
      )}
    </div>
  );
}