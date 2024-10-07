const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  conversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
