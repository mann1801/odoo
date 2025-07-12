import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';
import AnswerCard from '../components/AnswerCard';
import api from '../api';

export default function Profile() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.get(`/users/${user.username}`);
        setQuestions(res.data.data.questions);
        setAnswers(res.data.data.answers);
      } catch (err) {
        setQuestions([]);
        setAnswers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  if (!user) return <div className="text-center py-8">Not logged in.</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white p-6 rounded shadow mb-8 flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary-200 flex items-center justify-center text-3xl font-bold">
          {user.avatar ? <img src={user.avatar} alt="avatar" className="w-full h-full rounded-full" /> : user.username[0].toUpperCase()}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.username}</h2>
          <div className="text-gray-600 mb-2">{user.bio}</div>
          <div className="text-primary-700 font-semibold">Reputation: {user.reputation}</div>
        </div>
      </div>
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-2">Questions</h3>
        {loading ? <div>Loading...</div> : questions.map(q => <QuestionCard key={q._id} question={q} />)}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Answers</h3>
        {loading ? <div>Loading...</div> : answers.map(a => <AnswerCard key={a._id} answer={a} showQuestion />)}
      </div>
    </div>
  );
}