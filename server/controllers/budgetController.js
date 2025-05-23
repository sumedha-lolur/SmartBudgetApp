const Budget = require('../models/budgetModel');
const Transaction = require('../models/transactionModel');

/**
 * @desc    Create a new budget
 * @route   POST /api/budgets
 * @access  Private
 */
const createBudget = async (req, res, next) => {
  try {
    const { 
      name, 
      amount, 
      category, 
      startDate, 
      endDate, 
      color, 
      description 
    } = req.body;

    // Validate required fields
    if (!name || !amount || !category || !startDate || !endDate) {
      res.status(400);
      throw new Error('Please fill all required fields');
    }

    // Validate amount
    if (amount <= 0) {
      res.status(400);
      throw new Error('Budget amount must be greater than 0');
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) {
      res.status(400);
      throw new Error('End date must be after start date');
    }

    // Create budget
    const budget = await Budget.create({
      user: req.user._id,
      name,
      amount,
      category,
      startDate: start,
      endDate: end,
      color,
      description,
    });

    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all user budgets
 * @route   GET /api/budgets
 * @access  Private
 */
const getBudgets = async (req, res, next) => {
  try {
    const { active, month } = req.query;

    const query = {
      user: req.user._id,
    };

    // Filter by active status if specified
    if (active === 'true') {
      query.isActive = true;
    } else if (active === 'false') {
      query.isActive = false;
    }

    // Filter by month if specified
    if (month) {
      const date = new Date(month);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      query.$or = [
        { 
          startDate: { $lte: endOfMonth },
          endDate: { $gte: startOfMonth },
        }
      ];
    }

    const budgets = await Budget.find(query).sort({ startDate: -1 });

    // For each budget, calculate the amount spent
    const enrichedBudgets = await Promise.all(
      budgets.map(async (budget) => {
        const budgetObj = budget.toObject();
        
        // Calculate spent amount
        const spent = await calculateSpentAmount(
          req.user._id, 
          budget.category, 
          budget.startDate, 
          budget.endDate
        );
        
        budgetObj.spent = spent;
        budgetObj.percentageUsed = (spent / budget.amount) * 100;
        
        return budgetObj;
      })
    );

    res.json(enrichedBudgets);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single budget
 * @route   GET /api/budgets/:id
 * @access  Private
 */
const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    // Calculate spent amount
    const spent = await calculateSpentAmount(
      req.user._id,
      budget.category,
      budget.startDate,
      budget.endDate
    );

    const budgetObj = budget.toObject();
    budgetObj.spent = spent;
    budgetObj.percentageUsed = (spent / budget.amount) * 100;

    res.json(budgetObj);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update budget
 * @route   PUT /api/budgets/:id
 * @access  Private
 */
const updateBudget = async (req, res, next) => {
  try {
    const { 
      name, 
      amount, 
      category, 
      startDate, 
      endDate, 
      color, 
      isActive, 
      description 
    } = req.body;

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    // Update fields if provided
    budget.name = name || budget.name;
    budget.amount = amount !== undefined ? amount : budget.amount;
    budget.category = category || budget.category;
    budget.startDate = startDate ? new Date(startDate) : budget.startDate;
    budget.endDate = endDate ? new Date(endDate) : budget.endDate;
    budget.color = color || budget.color;
    budget.isActive = isActive !== undefined ? isActive : budget.isActive;
    budget.description = description !== undefined ? description : budget.description;

    // Validate amount
    if (budget.amount <= 0) {
      res.status(400);
      throw new Error('Budget amount must be greater than 0');
    }

    // Validate dates
    if (budget.endDate <= budget.startDate) {
      res.status(400);
      throw new Error('End date must be after start date');
    }

    const updatedBudget = await budget.save();

    // Calculate spent amount
    const spent = await calculateSpentAmount(
      req.user._id,
      updatedBudget.category,
      updatedBudget.startDate,
      updatedBudget.endDate
    );

    const budgetObj = updatedBudget.toObject();
    budgetObj.spent = spent;
    budgetObj.percentageUsed = (spent / updatedBudget.amount) * 100;

    res.json(budgetObj);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete budget
 * @route   DELETE /api/budgets/:id
 * @access  Private
 */
const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      res.status(404);
      throw new Error('Budget not found');
    }

    await budget.deleteOne();
    res.json({ message: 'Budget removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get budget summary statistics
 * @route   GET /api/budgets/summary
 * @access  Private
 */
const getBudgetSummary = async (req, res, next) => {
  try {
    const { month } = req.query;
    
    // Default to current month if not specified
    const targetMonth = month ? new Date(month) : new Date();
    const startOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const endOfMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

    // Get all budgets for this month
    const budgets = await Budget.find({
      user: req.user._id,
      isActive: true,
      startDate: { $lte: endOfMonth },
      endDate: { $gte: startOfMonth },
    });

    // Calculate total budget amount
    const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.amount, 0);

    // Calculate total spent across all categories
    let totalSpent = 0;
    for (const budget of budgets) {
      const spent = await calculateSpentAmount(
        req.user._id, 
        budget.category, 
        startOfMonth > budget.startDate ? startOfMonth : budget.startDate, 
        endOfMonth < budget.endDate ? endOfMonth : budget.endDate
      );
      totalSpent += spent;
    }

    // Calculate remaining
    const remaining = totalBudgeted - totalSpent;
    const percentageUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    res.json({
      totalBudgeted,
      totalSpent,
      remaining,
      percentageUsed,
      budgetCount: budgets.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to calculate amount spent in a category during a time period
 */
const calculateSpentAmount = async (userId, category, startDate, endDate) => {
  // First, check if we have tracking info for this budget
  const BudgetTracking = require('../models/budgetTrackingModel');
  const Budget = require('../models/budgetModel');
  
  // Find the budget for this category and date range
  const budget = await Budget.findOne({
    user: userId,
    category,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });
  
  if (budget) {
    // Check if we have tracking info
    const tracking = await BudgetTracking.findOne({
      budget: budget._id
    });
    
    if (tracking) {
      console.log(`Using budget tracking data for ${category}: ${tracking.spentAmount}`);
      return tracking.spentAmount;
    }
  }
  // Fallback to calculating from transactions
  console.log(`Searching for transactions in category: '${category}'`);
  
  // Helper function to normalize category names
  const normalizeCategory = (cat) => {
    // Remove extra whitespace and make case insensitive comparison
    return cat.trim().toLowerCase().replace(/\s+/g, ' ');
  };
  
  // Check all transactions regardless of category to see what we're working with
  const allTransactions = await Transaction.find({
    user: userId,
    type: 'expense',
    date: { $gte: startDate, $lte: endDate },
  });
  
  console.log(`All categories found:`, allTransactions.map(t => t.category));
  console.log(`Normalized budget category:`, normalizeCategory(category));
  console.log(`Normalized transaction categories:`, allTransactions.map(t => normalizeCategory(t.category)));
    // Now do the specific category query with both exact match and normalized match
  // We'll also check for transactions with similar categories
  const normalizedCategorySearch = normalizeCategory(category);
  
  const transactions = await Transaction.find({
    user: userId,
    date: { $gte: startDate, $lte: endDate },
    $and: [
      // Must be expense type
      { type: 'expense' },
      {
        $or: [
          // Exact match
          { category },
          // Case insensitive match
          { category: { $regex: new RegExp(`^${category}$`, 'i') } },
          // Normalized match - removes spacing issues
          { category: { $regex: new RegExp(`^${normalizedCategorySearch.replace(/[\/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, 'i') } },
          ...(category === 'Gifts' ? [
            { category: 'Gifts' },
            { category: 'Donations' },
            { category: { $regex: /gifts.*donations/i } },
            { category: { $regex: /donations.*gifts/i } }
          ] : [])
        ]
      }
    ]
  });
  console.log(`Found ${transactions.length} transactions for category ${category}`);  // Since all expense transactions have positive amounts in the DB but represent money spent,
  // we need to actually treat them as spent amounts
  const total = transactions.reduce((sum, transaction) => sum + Math.abs(transaction.amount), 0);
  console.log(`Total spent for ${category}: ${total}`);
  
  // Log each transaction for debugging
  if (transactions.length > 0) {
    console.log('Transactions found:');
    transactions.forEach(t => {
      console.log(`- ${t._id}: ${t.description}, Category: ${t.category}, Amount: ${t.amount}`);
    });
  }
  
  // If we found a budget but no tracking, create one now
  if (budget && total > 0) {
    await BudgetTracking.create({
      budget: budget._id,
      user: userId,
      spentAmount: total
    });
    console.log(`Created budget tracking for ${category} with amount ${total}`);
  }
  
  return total;
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
};
