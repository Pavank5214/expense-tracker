const express = require('express');
const router = express.Router();
const {
    getIncomes,
    setIncome,
    updateIncome,
    deleteIncome,
} = require('../controllers/incomeController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getIncomes).post(protect, setIncome);
router.route('/:id').put(protect, updateIncome).delete(protect, deleteIncome);

module.exports = router;
