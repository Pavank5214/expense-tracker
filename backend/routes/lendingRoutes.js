const express = require('express');
const router = express.Router();
const {
    getLendingTransactions,
    addLendingTransaction,
    getPeople,
    addPerson,
    getPersonDetails,
    updateLendingTransaction,
    deleteLendingTransaction,
    updatePerson,
    deletePerson,
} = require('../controllers/lendingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getLendingTransactions).post(protect, addLendingTransaction);
router.route('/:id').put(protect, updateLendingTransaction).delete(protect, deleteLendingTransaction);
router.route('/people').get(protect, getPeople).post(protect, addPerson);
router.route('/people/:id').get(protect, getPersonDetails).put(protect, updatePerson).delete(protect, deletePerson);

module.exports = router;
