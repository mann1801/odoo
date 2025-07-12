require('dotenv').config();

// Create a .env file in the backend directory with these variables:
// PORT=5000
// NODE_ENV=development
// MONGODB_URI=mongodb://localhost:27017/stackit
// JWT_SECRET=your_super_secret_jwt_key_change_in_production
// JWT_EXPIRE=7d
// CORS_ORIGIN=http://localhost:3000
// RATE_LIMIT_WINDOW_MS=900000
// RATE_LIMIT_MAX_REQUESTS=100

const config = {
  // Server Configuration
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'fallback_jwt_secret_change_in_production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // CORS Configuration
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Validation
  passwordMinLength: 6,
  usernameMinLength: 3,
  usernameMaxLength: 30,
  questionTitleMaxLength: 200,
  answerContentMaxLength: 10000,
  
  // Pagination
  defaultPageSize: 10,
  maxPageSize: 50
};

module.exports = config; 