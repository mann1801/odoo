import React, { useState } from 'react';

export default function TagList({ tags = [], setTags, editable }) {
  const [input, setInput] = useState('');

  const handleAdd = () => {
    if (input && !tags.includes(input)) {
      setTags([...tags, input]);
      setInput('');
    }
  };
  const handleRemove = (tag) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map(tag => {
        // Support both string and object tags
        const tagName = typeof tag === 'string' ? tag : tag.name;
        const tagKey = tag._id || tag.id || tag.name || tag;
        return (
          <span key={tagKey} className="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            #{tagName}
            {editable && (
              <button type="button" onClick={() => handleRemove(tag)} className="ml-1 text-red-500">×</button>
            )}
          </span>
        );
      })}
      {editable && (
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border px-2 py-1 rounded text-xs w-24"
            placeholder="Add tag"
          />
          <button type="button" onClick={handleAdd} className="text-primary-700 font-bold">+</button>
        </div>
      )}
    </div>
  );
} 