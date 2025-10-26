const express = require('express');
const router = express.Router();
const { getReviewsByProduct, addReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:productId', getReviewsByProduct);
router.post('/', protect, addReview);

module.exports = router;
