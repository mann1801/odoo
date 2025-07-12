const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const User = require('./models/User');
const config = require('./config');

async function printNotificationsForUser(username) {
  await mongoose.connect(config.mongoUri);

  const user = await User.findOne({ username });
  if (!user) {
    console.log('User not found:', username);
    process.exit(1);
  }

  const notifications = await Notification.find({ recipient: user._id }).sort({ createdAt: -1 });
  console.log(`Notifications for ${username} (${user._id}):`);
  notifications.forEach(n => {
    console.log(`- [${n.type}] ${n.title} | isRead: ${n.isRead} | isDeleted: ${n.isDeleted}`);
  });

  await mongoose.disconnect();
}

printNotificationsForUser(process.argv[2]);