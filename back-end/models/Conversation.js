const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('Conversation', ConversationSchema);

