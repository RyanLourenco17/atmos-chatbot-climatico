const mongoose = require('mongoose');
const moment = require('moment');

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
    enum: ['default', 'light'],
    default: 'default'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para formatar data ao salvar
UserSchema.pre('save', function(next) {
  this.createdAt = moment(this.createdAt).format('DD-MM-YYYY HH:mm:ss');
  next();
});

module.exports = mongoose.model('User', UserSchema);
