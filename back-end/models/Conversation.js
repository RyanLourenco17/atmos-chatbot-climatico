const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', MessageSchema);

const ConversationSchema = new mongoose.Schema({
  messages: [MessageSchema],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Conversation', ConversationSchema);

