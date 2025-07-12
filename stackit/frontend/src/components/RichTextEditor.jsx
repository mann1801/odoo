import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'image'],
    [{ 'align': [] }],
    ['clean']
  ]
};

const formats = [
  'header', 'bold', 'italic', 'strike',
  'list', 'bullet', 'link', 'image', 'align'
];

export default function RichTextEditor({ value, onChange, placeholder = "Write your content here..." }) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
      style={{ minHeight: 120 }}
    />
  );
}
