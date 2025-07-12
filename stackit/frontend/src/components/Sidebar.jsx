import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Sidebar() {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    api.get('/tags/popular').then(res => setTags(res.data.data.tags));
  }, []);

  return (
    <aside className="bg-white p-5 rounded shadow mb-6">
      <h3 className="text-lg font-bold mb-3">Trending Tags</h3>
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map(tag => (
          <span key={tag.name} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium">#{tag.name}</span>
        ))}
      </div>
      <div className="text-sm text-gray-600">Want to ask something? <span className="text-primary-700 font-semibold">Join the discussion!</span></div>
    </aside>
  );
}