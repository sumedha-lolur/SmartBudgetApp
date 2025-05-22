const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add an account name'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please specify account type'],
      enum: ['Checking', 'Savings', 'Credit Card', 'Cash', 'Investment', 'Other'],
    },
    balance: {
      type: Number,
      required: [true, 'Please specify initial balance'],
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    description: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '#0d6efd', // Default blue color
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;