const mongoose = require('mongoose');
const User = require('./models/User');
const Notification = require('./models/Notification');
const config = require('./config');

async function createTestNotifications() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Find or create a test user
    let testUser = await User.findOne({ username: 'testuser' });
    if (!testUser) {
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'TestPass123'
      });
      console.log('Created test user:', testUser.username);
    }

    // Create some test notifications
    const notifications = [
      {
        recipient: testUser._id,
        type: 'question_answered',
        title: 'Your question received an answer',
        message: 'JohnDoe answered your question "How to implement authentication?"',
        data: {
          questionId: new mongoose.Types.ObjectId(),
          answerId: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId()
        }
      },
      {
        recipient: testUser._id,
        type: 'comment_added',
        title: 'Someone commented on your answer',
        message: 'JaneSmith commented on your answer to "React best practices"',
        data: {
          questionId: new mongoose.Types.ObjectId(),
          answerId: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId()
        }
      },
      {
        recipient: testUser._id,
        type: 'user_mentioned',
        title: 'You were mentioned in a comment',
        message: 'BobWilson mentioned you in a comment on "JavaScript debugging"',
        data: {
          questionId: new mongoose.Types.ObjectId(),
          answerId: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId()
        }
      }
    ];

    for (const notificationData of notifications) {
      const notification = await Notification.create(notificationData);
      console.log('Created notification:', notification.title);
    }

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(testUser._id);
    console.log('Unread notifications count:', unreadCount);

    // Get all notifications
    const allNotifications = await Notification.getUserNotifications(testUser._id);
    console.log('Total notifications:', allNotifications.length);

    console.log('Test notifications created successfully!');
  } catch (error) {
    console.error('Error creating test notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

createTestNotifications(); 