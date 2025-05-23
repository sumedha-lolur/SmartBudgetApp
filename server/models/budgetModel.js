const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: [true, 'Please add a budget name'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Please specify budget amount'],
      min: [0, 'Budget amount cannot be negative'],
    },    
    category: {
      type: String,
      required: [true, 'Please specify a category'],
      enum: [
        'Housing', 'Transportation', 'Food', 'Utilities', 'Healthcare',
        'Insurance', 'Debt', 'Personal', 'Entertainment', 'Education',
        'Savings', 'Gifts', 'Donations', 'Other'
      ],
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    color: {
      type: String,
      default: '#198754', // Default green color
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for calculating the amount spent in this budget category
budgetSchema.virtual('spent').get(function () {
  return 0; // Will be calculated in the controller by querying transactions
});

// Virtual for calculating the percentage used
budgetSchema.virtual('percentageUsed').get(function () {
  return 0; // Will be calculated in the controller
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;