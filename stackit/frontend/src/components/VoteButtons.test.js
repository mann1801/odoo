import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VoteButtons from './VoteButtons';
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

describe('VoteButtons', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders vote buttons with vote count', () => {
    renderWithAuth(<VoteButtons votes={5} />);
    
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByTitle('Upvote')).toBeInTheDocument();
    expect(screen.getByTitle('Downvote')).toBeInTheDocument();
  });

  test('shows active state for user vote', () => {
    renderWithAuth(<VoteButtons votes={3} userVote="upvote" />);
    
    const upvoteButton = screen.getByTitle('Upvote');
    expect(upvoteButton).toHaveClass('text-primary-600');
  });

  test('calls API when voting on answer', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { success: true } });
    
    const onVoted = jest.fn();
    renderWithAuth(<VoteButtons votes={0} answerId="123" onVoted={onVoted} />);
    
    const upvoteButton = screen.getByTitle('Upvote');
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/answers/123/vote', { voteType: 'upvote' });
      expect(onVoted).toHaveBeenCalled();
    });
  });

  test('calls API when voting on question', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { success: true } });
    
    const onVoted = jest.fn();
    renderWithAuth(<VoteButtons votes={0} questionId="456" onVoted={onVoted} />);
    
    const downvoteButton = screen.getByTitle('Downvote');
    fireEvent.click(downvoteButton);
    
    await waitFor(() => {
      expect(mockApi.post).toHaveBeenCalledWith('/questions/456/vote', { voteType: 'downvote' });
      expect(onVoted).toHaveBeenCalled();
    });
  });

  test('shows alert when user is not authenticated', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithAuth(<VoteButtons votes={0} />, { isAuthenticated: false });
    
    const upvoteButton = screen.getByTitle('Upvote');
    fireEvent.click(upvoteButton);
    
    expect(alertSpy).toHaveBeenCalledWith('Please log in to vote!');
    alertSpy.mockRestore();
  });

  test('handles API errors gracefully', async () => {
    const errorMessage = 'You cannot vote on your own answer';
    mockApi.post.mockRejectedValueOnce({ 
      response: { data: { message: errorMessage } } 
    });
    
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    renderWithAuth(<VoteButtons votes={0} answerId="123" />);
    
    const upvoteButton = screen.getByTitle('Upvote');
    fireEvent.click(upvoteButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(errorMessage);
    });
    
    alertSpy.mockRestore();
  });
}); 