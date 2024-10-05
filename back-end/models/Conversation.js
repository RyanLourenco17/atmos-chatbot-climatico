const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: false,
  },
  role: {
    type: String,
    enum: ['usuário', 'sistema'],
    required: true,
  },
  status: {
    type: String,
    enum: ['pendente', 'respondida', 'erro'],
    default: 'pendente',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Conversation', ConversationSchema);

