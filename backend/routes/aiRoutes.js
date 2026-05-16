const express = require('express');
const router = express.Router();
const { parseLedgerText } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.route('/parse').post(protect, parseLedgerText);

module.exports = router;
