const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    enum: ['Padrão', 'Acessível'],
    default: 'Padrão',
  },
  conversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});


module.exports = mongoose.model('User', UserSchema);
