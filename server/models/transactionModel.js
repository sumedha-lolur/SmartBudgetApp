const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Account',
    },
    type: {
      type: String,
      required: true,
      enum: ['expense', 'income', 'transfer'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount'],
      min: [0.01, 'Amount must be at least 0.01'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare',
        'Insurance', 'Debt', 'Personal', 'Entertainment', 'Education',
        'Salary', 'Gifts', 'Refund', 'Investment', 'Transfer', 'Other'
      ],
    },
    date: {
      type: Date,
      default: Date.now,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: function() {
        return this.type === 'transfer';
      },
    },
    isReconciled: {
      type: Boolean,
      default: false,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ account: 1, date: -1 });
transactionSchema.index({ category: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;