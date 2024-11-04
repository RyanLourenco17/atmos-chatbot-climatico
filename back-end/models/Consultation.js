const mongoose = require('mongoose');
const moment = require('moment');

const ConsultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


ConsultationSchema.pre('save', function(next) {
  this.createdAt = moment(this.createdAt).format('DD-MM-YYYY HH:mm:ss');
  next();
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
