import React, { useState } from 'react';
import RichTextEditor from '../components/RichTextEditor';
import TagList from '../components/TagList';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function AskQuestion() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // New: frontend validation
  const validate = () => {
    if (title.trim().length < 10) {
      setError('Title must be at least 10 characters.');
      return false;
    }
    if (description.trim().length < 20) {
      setError('Description must be at least 20 characters.');
      return false;
    }
    if (!tags || tags.length === 0) {
      setError('Please add at least one tag.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/questions', {
        title,
        description,
        tags: tags.map(tag => tag.replace(/^#/, '').toLowerCase())
      });
      navigate('/');
    } catch (err) {
      // Show backend validation errors if any
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setError(err.response.data.errors[0].msg || 'Failed to submit question');
      } else {
        setError(err.response?.data?.message || 'Failed to submit question');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Ask a Question</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <input
          type="text"
          placeholder="Title (e.g. How does JWT authentication work in React?)"
          className="border px-3 py-2 rounded"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          minLength={10}
        />
        <RichTextEditor value={description} onChange={setDescription} />
        <TagList tags={tags} setTags={setTags} editable />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="bg-primary-600 text-white py-2 rounded hover:bg-primary-700" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>
    </div>
  );
}