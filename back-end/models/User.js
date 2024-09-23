const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  theme: {
    type: String,
    enum: ['Padrão', 'Acessível'],
    default: 'Padrão',
  },
}, { timestamps: true });


module.exports = mongoose.model('User', UserSchema);
