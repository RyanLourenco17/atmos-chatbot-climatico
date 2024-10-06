const mongoose = require('mongoose');
const ConsultationSchema = require('./Consultation')

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
  climateConsultation: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
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
