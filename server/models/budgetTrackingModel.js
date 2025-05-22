const mongoose = require('mongoose');

const budgetTrackingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    budget: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Budget',
    },
    spentAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    }
  },
  {
    timestamps: true
  }
);

const BudgetTracking = mongoose.model('BudgetTracking', budgetTrackingSchema);

module.exports = BudgetTracking;
