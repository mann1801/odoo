import React, { useEffect, useState } from 'react';
import QuestionCard from '../components/QuestionCard';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const res = await api.get('/questions');
        setQuestions(res.data.data.questions);
      } catch (err) {
        // Optionally handle error
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  return (
    <div className="flex max-w-6xl mx-auto mt-8 gap-8">
      <div className="w-2/3">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Top Questions</h1>
          <Link to="/ask" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Ask Question</Link>
        </div>
        {loading ? (
          <div className="text-center py-8">Loading questions...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {questions.length === 0 ? (
              <div className="text-center text-gray-500">No questions found.</div>
            ) : (
              questions.map(q => (
                <QuestionCard key={q._id} question={q} />
              ))
            )}
          </div>
        )}
      </div>
      <div className="w-1/3">
        <Sidebar />
      </div>
    </div>
  );
}
