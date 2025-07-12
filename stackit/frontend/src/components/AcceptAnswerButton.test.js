import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AcceptAnswerButton from './AcceptAnswerButton';
import { AuthProvider } from '../context/AuthContext';

// Mock the API
jest.mock('../api', () => ({
  put: jest.fn()
}));

const mockApi = require('../api');

const renderWithAuth = (component, authValue = { isAuthenticated: true, user: { _id: 'user123', role: 'user' } }) => {
  return render(
    <AuthProvider value={authValue}>
      {component}
    </AuthProvider>
  );
};

describe('AcceptAnswerButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders accept button for question author', () => {
    const answer = { _id: 'answer123', isAccepted: false };
    const questionAuthorId = 'user123';
    
    renderWithAuth(
      <AcceptAnswerButton 
        answer={answer} 
        questionAuthorId={questionAuthorId} 
      />
    );
    
    expect(screen.getByText('Accept')).toBeInTheDocument();
    expect(screen.getByTitle('Accept answer')).toBeInTheDocument();
  });

  test('renders accepted state for accepted answer', () => {
    const answer = { _id: 'answer123', isAccepted: true };
    const questionAuthorId = 'user123';
    
    renderWithAuth(
      <AcceptAnswerButton 
        answer={answer} 
        questionAuthorId={questionAuthorId} 
      />
    );
    
    expect(screen.getByText('Accepted')).toBeInTheDocument();
    expect(screen.getByTitle('Unaccept answer')).toBeInTheDocument();
  });

  test('does not render for non-question author', () => {
    const answer = { _id: 'answer123', isAccepted: false };
    const questionAuthorId = 'otheruser';
    
    const { container } = renderWithAuth(
      <AcceptAnswerButton 
        answer={answer} 
        questionAuthorId={questionAuthorId} 
      />
    );
    
    expect(container.firstChild).toBeNull();
  });

  test('renders for admin user', () => {
    const answer = { _id: 'answer123', isAccepted: false };
    const questionAuthorId = 'otheruser';
    
    renderWithAuth(
      <AcceptAnswerButton 
        answer={answer} 
        questionAuthorId={questionAuthorId} 
      />,
      { isAuthenticated: true, user: { _id: 'admin123', role: 'admin' } }
    );
    
    expect(screen.getByText('Accept')).toBeInTheDocument();
  });

  test('calls API when accepting answer', async () => {
    mockApi.put.mockResolvedValueOnce({ data: { success: true } });
    
    const answer = { _id: 'answer123', isAccepted: false };
    const questionAuthorId = 'user123';
    const onAccepted = jest.fn();
    
    renderWithAuth(
      <AcceptAnswerButton 
        answer={answer} 
        questionAuthorId={questionAuthorId}
        onAccepted={onAccepted}
      />
    );
    
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(mockApi.put).toHaveBeenCalledWith('/answers/answer123/accept');
      expect(onAccepted).toHaveBeenCalled();
    });
  });

  test('handles API errors gracefully', async () => {
    const errorMessage = 'Failed to accept answer';
    mockApi.put.mockRejectedValueOnce({ 
      response: { data: { message: errorMessage } } 
    });
    
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    const answer = { _id: 'answer123', isAccepted: false };
    const questionAuthorId = 'user123';
    
    renderWithAuth(
      <AcceptAnswerButton 
        answer={answer} 
        questionAuthorId={questionAuthorId}
      />
    );
    
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);
    
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(errorMessage);
    });
    
    alertSpy.mockRestore();
  });

  test('shows loading state during API call', async () => {
    mockApi.put.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    const answer = { _id: 'answer123', isAccepted: false };
    const questionAuthorId = 'user123';
    
    renderWithAuth(
      <AcceptAnswerButton 
        answer={answer} 
        questionAuthorId={questionAuthorId}
      />
    );
    
    const acceptButton = screen.getByText('Accept');
    fireEvent.click(acceptButton);
    
    expect(screen.getByText('⟳')).toBeInTheDocument();
    expect(acceptButton).toBeDisabled();
  });
}); 