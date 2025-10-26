const express = require('express');
const router = express.Router();
const {
    placeOrder,
    trackOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    checkPurchaseStatus
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, placeOrder);
router.post('/track', trackOrder); // Public, but requires email and ID
router.get('/myorders', protect, getUserOrders);
router.get('/purchase-status/:productId', protect, checkPurchaseStatus);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);


module.exports = router;
