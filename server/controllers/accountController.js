const Account = require('../models/accountModel');
const Transaction = require('../models/transactionModel');

/**
 * @desc    Create a new account
 * @route   POST /api/accounts
 * @access  Private
 */
const createAccount = async (req, res, next) => {
  try {
    const { name, type, balance, currency, description, color } = req.body;

    if (!name || !type) {
      res.status(400);
      throw new Error('Please provide name and type');
    }

    const account = await Account.create({
      user: req.user._id,
      name,
      type,
      balance: balance || 0,
      currency: currency || 'USD',
      description,
      color,
    });

    res.status(201).json(account);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all user accounts
 * @route   GET /api/accounts
 * @access  Private
 */
const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id });
    res.json(accounts);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single account
 * @route   GET /api/accounts/:id
 * @access  Private
 */
const getAccountById = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }

    res.json(account);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update account
 * @route   PUT /api/accounts/:id
 * @access  Private
 */
const updateAccount = async (req, res, next) => {
  try {
    const { name, type, balance, currency, description, color, isActive } = req.body;

    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }

    account.name = name || account.name;
    account.type = type || account.type;
    account.balance = balance !== undefined ? balance : account.balance;
    account.currency = currency || account.currency;
    account.description = description !== undefined ? description : account.description;
    account.color = color || account.color;
    account.isActive = isActive !== undefined ? isActive : account.isActive;

    const updatedAccount = await account.save();
    res.json(updatedAccount);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete account
 * @route   DELETE /api/accounts/:id
 * @access  Private
 */
const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }

    // Check if there are any transactions associated with this account
    const transactionCount = await Transaction.countDocuments({
      $or: [
        { account: req.params.id },
        { toAccount: req.params.id },
      ],
    });

    if (transactionCount > 0) {
      res.status(400);
      throw new Error('Cannot delete account with transactions. Consider deactivating it instead.');
    }

    await account.deleteOne();
    res.json({ message: 'Account removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get account balance history
 * @route   GET /api/accounts/:id/history
 * @access  Private
 */
const getAccountHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { period } = req.query; // daily, weekly, monthly
    
    // First check if account exists and belongs to user
    const account = await Account.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!account) {
      res.status(404);
      throw new Error('Account not found');
    }

    // Get transactions for this account
    const transactions = await Transaction.find({
      $or: [
        { account: id },
        { toAccount: id },
      ],
    }).sort({ date: 1 });

    // Calculate balance history
    const balanceHistory = [];
    let currentBalance = account.balance;
    
    // Process transactions to create history points
    // This is simplified and would need to be expanded based on the period requested
    // and grouped by day/week/month

    res.json(balanceHistory);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  getAccountHistory,
};
