import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AnswerForm from './AnswerForm';
import { AuthProvider } from '../context/AuthContext';

// Mock the API
jest.mock('../api', () => ({
  post: jest.fn()
}));

const mockApi = require('../api');

const renderWithAuth = (component, authValue = { isAuthenticated: true, user: { username: 'testuser' } }) => {
  return render(
    <AuthProvider value={authValue}>
      {component}
    </AuthProvider>
  );
};

describe('AnswerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login prompt when user is not authenticated', () => {
    renderWithAuth(<AnswerForm questionId="123" />, { isAuthenticated: false });
    
    expect(screen.getByText('Post Your Answer')).toBeInTheDocument();
    expect(screen.getByText('You must be logged in to post an answer')).toBeInTheDocument();
    expect(screen.getByText('Log In')).toBeInTheDocument();
  });

  test('renders answer form when user is authenticated', () => {
    renderWithAuth(<AnswerForm questionId="123" />);
    
    expect(screen.getByText('Your Answer')).toBeInTheDocument();
    expect(screen.getByText('Write your answer')).toBeInTheDocument();
    expect(screen.getByText('Post Answer')).toBeInTheDocument();
  });

  test('shows error for empty content', async () => {
    renderWithAuth(<AnswerForm questionId="123" />);
    
    const submitButton = screen.getByText('Post Answer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Answer content is required')).toBeInTheDocument();
    });
  });

  test('shows error for content too short', async () => {
    renderWithAuth(<AnswerForm questionId="123" />);
    
    const editor = screen.getByRole('textbox');
    fireEvent.change(editor, { target: { value: 'Short' } });
    
    const submitButton = screen.getByText('Post Answer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Answer must be at least 10 characters long')).toBeInTheDocument();
    });
  });

  test('submits answer successfully', async () => {
    const mockAnswer = { _id: '456', content: 'Test answer content' };
    mockApi.post.mockResolvedValueOnce({ data: { data: { answer: mockAnswer } } });
    
    const onAnswerSubmitted = jest.fn();
    renderWithAuth(<AnswerForm questionId="123" onAnswerSubmitted={onAnswerSubmitted} />);
    
    const editor = screen.getByRole('textbox');
    fireEvent.change(editor, { target: { value: 'This is a test answer with enough characters' } });
    
    const submitButton = screen.getByText('Post Answer');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/questions/123/answers', {
        content: 'This is a test answer with enough characters'
      });
      expect(onAnswerSubmitted).toHaveBeenCalledWith(mockAnswer);
    });
  });
}); 