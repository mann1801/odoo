# odoo

Problem statement: StackIt – A Minimal Q&A Forum Platform

Team name: Techno Wizards
Email: mannsoni181@gmail.com

# StackIt - Q&A Platform

A modern Q&A platform built with React, Node.js, and MongoDB.

## Features

### Questions
- Ask questions with rich text formatting
- Tag questions for better organization
- Vote on questions
- Search and filter questions

### Answers
- **Post answers to any question** - Users can provide detailed answers using the same rich text editor as questions
- **Rich text formatting** - Answers support the same formatting options as questions (bold, italic, lists, links, etc.)
- **Authentication required** - Only logged-in users can post answers
- **Vote on answers** - Community can upvote/downvote answers
- **Accept answers** - Question authors can mark answers as accepted
- **Comments on answers** - Users can add comments to answers for clarification

### Voting System
- **Upvote/Downvote answers** - Users can vote on answers to help identify the best solutions
- **Vote on questions** - Community can vote on question quality
- **Visual feedback** - Active votes are highlighted and vote counts are displayed
- **Vote statistics** - Shows vote counts and positive vote percentages
- **Authentication required** - Only logged-in users can vote
- **Prevent self-voting** - Users cannot vote on their own content

### Answer Acceptance
- **Question owner control** - Only the question author can accept answers
- **Admin override** - Administrators can also accept answers
- **Single acceptance** - Only one answer can be accepted per question
- **Visual indicators** - Accepted answers have green borders and badges
- **Toggle functionality** - Question owners can unaccept answers if needed

### User Management
- User registration and authentication
- User profiles with reputation tracking
- Role-based access control (user, moderator, admin)

### Notifications
- Real-time notifications for new answers
- Email notifications for important events

## Tech Stack

### Frontend
- React 18
- React Router for navigation
- React Quill for rich text editing
- Tailwind CSS for styling
- Axios for API calls

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for input validation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd stackit/backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd stackit/frontend
   npm install
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory:
   ```
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

5. Start the backend server:
   ```bash
   cd stackit/backend
   npm start
   ```

6. Start the frontend development server:
   ```bash
   cd stackit/frontend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## API Endpoints

### Questions
- `GET /api/questions` - List all questions
- `GET /api/questions/:id` - Get a specific question
- `POST /api/questions` - Create a new question
- `PUT /api/questions/:id` - Update a question
- `DELETE /api/questions/:id` - Delete a question
- `POST /api/questions/:id/vote` - Vote on a question

### Answers
- `GET /api/questions/:questionId/answers` - Get answers for a question
- `POST /api/questions/:questionId/answers` - Create an answer for a question
- `PUT /api/answers/:id` - Update an answer
- `DELETE /api/answers/:id` - Delete an answer
- `POST /api/answers/:id/vote` - Vote on an answer
- `PUT /api/answers/:id/accept` - Accept/unaccept an answer
- `POST /api/answers/:id/comments` - Add a comment to an answer

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

## Answer Functionality

The answer system includes the following features:

1. **Rich Text Editor**: Answers use the same React Quill editor as questions, supporting:
   - Bold, italic, and strikethrough text
   - Ordered and unordered lists
   - Links and images
   - Text alignment
   - Headers

2. **Authentication**: Only logged-in users can post answers. Non-authenticated users see a login prompt.

3. **Validation**: 
   - Answers must be at least 10 characters long
   - Maximum length of 10,000 characters
   - Content is required

4. **User Experience**:
   - Real-time character count
   - Loading states during submission
   - Error handling and display
   - Automatic refresh of answers list after submission

5. **Voting System**: Users can upvote/downvote answers to help the community identify the best solutions.

6. **Answer Acceptance**: Question authors can mark answers as accepted, providing a clear indication of the best solution.

7. **Comments**: Users can add comments to answers for clarification or follow-up questions.

## Voting & Acceptance System

### Voting Features

1. **Vote Buttons**: 
   - Upvote (▲) and downvote (▼) buttons for questions and answers
   - Visual feedback showing user's current vote state
   - Vote counts displayed prominently

2. **Vote Statistics**:
   - Total vote count (upvotes - downvotes)
   - Positive vote percentage
   - Visual progress bar showing vote ratio

3. **Vote Restrictions**:
   - Only authenticated users can vote
   - Users cannot vote on their own content
   - One vote per user per content item

4. **Real-time Updates**:
   - Vote counts update immediately after voting
   - User vote state is preserved across page refreshes

### Answer Acceptance Features

1. **Acceptance Control**:
   - Only question authors can accept answers
   - Administrators have override privileges
   - One answer per question can be accepted

2. **Visual Indicators**:
   - Accepted answers have green borders
   - "✓ Accepted" badge displayed prominently
   - Accept/Unaccept button for question owners

3. **Acceptance Actions**:
   - Question owners can accept any answer
   - Previously accepted answers are automatically unaccepted
   - Question owners can unaccept answers to change their choice

4. **Notifications**:
   - Answer authors receive notifications when their answers are accepted
   - Question authors receive notifications when their questions receive answers

### User Experience

1. **For Voters**:
   - Clear visual feedback for vote state
   - Immediate response to vote actions
   - Error messages for invalid votes (e.g., voting on own content)

2. **For Question Owners**:
   - Accept button only visible to question authors
   - Clear indication of accepted answer
   - Ability to change accepted answer

3. **For All Users**:
   - Vote statistics help identify quality content
   - Accepted answers are clearly marked as the best solution
   - Real-time updates keep content current

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 
