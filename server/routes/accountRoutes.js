const express = require('express');
const router = express.Router();
const {
  createAccount,
  getAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  getAccountHistory,
} = require('../controllers/accountController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Routes
router.route('/')
  .post(createAccount)
  .get(getAccounts);

router.route('/:id')
  .get(getAccountById)
  .put(updateAccount)
  .delete(deleteAccount);

router.get('/:id/history', getAccountHistory);

module.exports = router;
