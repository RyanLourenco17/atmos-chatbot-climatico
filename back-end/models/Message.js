const mongoose = require('mongoose');
const moment = require('moment');

const MessageSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
  },
  parameters: {
    type: mongoose.Schema.Types.Mixed,
  },
  intentName: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


MessageSchema.pre('save', function(next) {
  this.createdAt = moment(this.createdAt).format('DD-MM-YYYY HH:mm:ss');
  next();
});

module.exports = mongoose.model('Message', MessageSchema);
