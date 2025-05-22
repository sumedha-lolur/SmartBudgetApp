const Transaction = require('../models/transactionModel');
const Account = require('../models/accountModel');

/**
 * @desc    Create a new transaction
 * @route   POST /api/transactions
 * @access  Private
 */
const createTransaction = async (req, res, next) => {
  try {
    const { 
      account, 
      type, 
      amount, 
      description, 
      category, 
      date, 
      toAccount, 
      tags, 
      notes 
    } = req.body;

    // Validate required fields
    if (!account || !type || !amount || !description || !category) {
      res.status(400);
      throw new Error('Please fill all required fields');
    }

    // Validate amount
    if (amount <= 0) {
      res.status(400);
      throw new Error('Amount must be greater than 0');
    }

    // For transfers, both accounts are needed
    if (type === 'transfer' && !toAccount) {
      res.status(400);
      throw new Error('Transfer requires a destination account');
    }

    // Check if account belongs to user
    const fromAccount = await Account.findOne({
      _id: account,
      user: req.user._id,
    });

    if (!fromAccount) {
      res.status(404);
      throw new Error('Account not found');
    }

    // If it's a transfer, verify toAccount
    if (type === 'transfer') {
      const destinationAccount = await Account.findOne({
        _id: toAccount,
        user: req.user._id,
      });

      if (!destinationAccount) {
        res.status(404);
        throw new Error('Destination account not found');
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      account,
      type,
      amount,
      description,
      category,
      date: date ? new Date(date) : new Date(),
      toAccount: type === 'transfer' ? toAccount : null,
      tags,
      notes,
    });

    // Update account balances
    if (type === 'expense') {
      fromAccount.balance -= amount;
      await fromAccount.save();
    } else if (type === 'income') {
      fromAccount.balance += amount;
      await fromAccount.save();
    } else if (type === 'transfer') {
      fromAccount.balance -= amount;
      await fromAccount.save();

      const toAccountObj = await Account.findById(toAccount);
      toAccountObj.balance += amount;
      await toAccountObj.save();
    }

    res.status(201).json(transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all user transactions
 * @route   GET /api/transactions
 * @access  Private
 */
const getTransactions = async (req, res, next) => {
  try {
    const { 
      account, 
      type, 
      category, 
      startDate, 
      endDate, 
      minAmount, 
      maxAmount,
      search,
      page = 1,
      limit = 20,
      sort = '-date'
    } = req.query;

    // Build query
    const query = { user: req.user._id };

    // Filter by account
    if (account) {
      query.$or = [
        { account },
        { toAccount: account }
      ];
    }

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Filter by amount range
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) {
        query.amount.$gte = Number(minAmount);
      }
      if (maxAmount) {
        query.amount.$lte = Number(maxAmount);
      }
    }

    // Search by description
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get transactions with pagination and sorting
    const transactions = await Transaction.find(query)
      .populate('account', 'name type color')
      .populate('toAccount', 'name type color')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Count total documents for pagination
    const totalTransactions = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalTransactions,
        pages: Math.ceil(totalTransactions / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single transaction
 * @route   GET /api/transactions/:id
 * @access  Private
 */
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
      .populate('account', 'name type balance color')
      .populate('toAccount', 'name type balance color');

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    res.json(transaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update transaction
 * @route   PUT /api/transactions/:id
 * @access  Private
 */
const updateTransaction = async (req, res, next) => {
  try {
    const {
      account,
      type,
      amount,
      description,
      category,
      date,
      toAccount,
      isReconciled,
      tags,
      notes
    } = req.body;

    // Find the transaction
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Save original values to handle balance changes
    const originalAccount = transaction.account;
    const originalToAccount = transaction.toAccount;
    const originalType = transaction.type;
    const originalAmount = transaction.amount;

    // First, revert the original transaction's effect on balances
    if (originalType === 'expense') {
      const accountToUpdate = await Account.findById(originalAccount);
      accountToUpdate.balance += originalAmount;
      await accountToUpdate.save();
    } else if (originalType === 'income') {
      const accountToUpdate = await Account.findById(originalAccount);
      accountToUpdate.balance -= originalAmount;
      await accountToUpdate.save();
    } else if (originalType === 'transfer') {
      const fromAccount = await Account.findById(originalAccount);
      fromAccount.balance += originalAmount;
      await fromAccount.save();

      const toAccountObj = await Account.findById(originalToAccount);
      toAccountObj.balance -= originalAmount;
      await toAccountObj.save();
    }

    // Update transaction fields
    transaction.account = account || transaction.account;
    transaction.type = type || transaction.type;
    transaction.amount = amount !== undefined ? amount : transaction.amount;
    transaction.description = description || transaction.description;
    transaction.category = category || transaction.category;
    transaction.date = date ? new Date(date) : transaction.date;
    transaction.toAccount = type === 'transfer' ? (toAccount || transaction.toAccount) : null;
    transaction.isReconciled = isReconciled !== undefined ? isReconciled : transaction.isReconciled;
    transaction.tags = tags || transaction.tags;
    transaction.notes = notes !== undefined ? notes : transaction.notes;

    // Validate new values
    if (transaction.amount <= 0) {
      res.status(400);
      throw new Error('Amount must be greater than 0');
    }

    if (transaction.type === 'transfer' && !transaction.toAccount) {
      res.status(400);
      throw new Error('Transfer requires a destination account');
    }

    // Apply the new transaction's effect on balances
    if (transaction.type === 'expense') {
      const accountToUpdate = await Account.findById(transaction.account);
      accountToUpdate.balance -= transaction.amount;
      await accountToUpdate.save();
    } else if (transaction.type === 'income') {
      const accountToUpdate = await Account.findById(transaction.account);
      accountToUpdate.balance += transaction.amount;
      await accountToUpdate.save();
    } else if (transaction.type === 'transfer') {
      const fromAccount = await Account.findById(transaction.account);
      fromAccount.balance -= transaction.amount;
      await fromAccount.save();

      const toAccountObj = await Account.findById(transaction.toAccount);
      toAccountObj.balance += transaction.amount;
      await toAccountObj.save();
    }

    const updatedTransaction = await transaction.save();

    res.json(updatedTransaction);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete transaction
 * @route   DELETE /api/transactions/:id
 * @access  Private
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      res.status(404);
      throw new Error('Transaction not found');
    }

    // Update account balances before deleting
    if (transaction.type === 'expense') {
      const accountToUpdate = await Account.findById(transaction.account);
      accountToUpdate.balance += transaction.amount;
      await accountToUpdate.save();
    } else if (transaction.type === 'income') {
      const accountToUpdate = await Account.findById(transaction.account);
      accountToUpdate.balance -= transaction.amount;
      await accountToUpdate.save();
    } else if (transaction.type === 'transfer') {
      const fromAccount = await Account.findById(transaction.account);
      fromAccount.balance += transaction.amount;
      await fromAccount.save();

      const toAccountObj = await Account.findById(transaction.toAccount);
      toAccountObj.balance -= transaction.amount;
      await toAccountObj.save();
    }

    await transaction.deleteOne();
    res.json({ message: 'Transaction removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get transaction statistics
 * @route   GET /api/transactions/stats
 * @access  Private
 */
const getTransactionStats = async (req, res, next) => {
  try {
    const { period, startDate, endDate } = req.query;
    
    // Default to last 30 days if not specified
    const end = endDate ? new Date(endDate) : new Date();
    let start;
    
    if (startDate) {
      start = new Date(startDate);
    } else {
      // Default periods
      if (period === 'week') {
        start = new Date(end);
        start.setDate(end.getDate() - 7);
      } else if (period === 'month') {
        start = new Date(end);
        start.setMonth(end.getMonth() - 1);
      } else if (period === 'year') {
        start = new Date(end);
        start.setFullYear(end.getFullYear() - 1);
      } else {
        // Default to last 30 days
        start = new Date(end);
        start.setDate(end.getDate() - 30);
      }
    }

    // Get income stats by category
    const incomeStats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'income',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    // Get expense stats by category
    const expenseStats = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'expense',
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
    ]);

    // Get daily expense/income totals for trend analysis
    const dailyTrends = await Transaction.aggregate([
      {
        $match: {
          user: req.user._id,
          type: { $in: ['income', 'expense'] },
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
    ]);

    // Calculate summary statistics
    const totalIncome = incomeStats.reduce((acc, stat) => acc + stat.totalAmount, 0);
    const totalExpense = expenseStats.reduce((acc, stat) => acc + stat.totalAmount, 0);
    const netIncome = totalIncome - totalExpense;

    res.json({
      summary: {
        totalIncome,
        totalExpense,
        netIncome,
        savingsRate: totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0,
      },
      incomeByCategory: incomeStats,
      expenseByCategory: expenseStats,
      dailyTrends,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
};
