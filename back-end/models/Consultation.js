const mongoose = require('mongoose');

const ConsultationSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Consultation', ConsultationSchema);
