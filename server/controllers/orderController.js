const { orders } = require('../data');
const { OrderStatus, PaymentMethod } = require('../types');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const placeOrder = (req, res) => {
    const { items, total, shippingDetails, paymentMethod, paymentTransactionId, paymentScreenshot } = req.body;
    
    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No order items' });
    }

    const newOrder = {
        id: `HM-${Date.now().toString(36).toUpperCase()}`,
        userEmail: req.user.email, // From protect middleware
        items,
        total,
        shippingDetails,
        paymentMethod,
        paymentTransactionId,
        paymentScreenshot,
        createdAt: new Date().toISOString(),
        status: paymentMethod === PaymentMethod.Online ? OrderStatus.PaymentVerification : OrderStatus.Packing,
    };

    orders.push(newOrder);

    // Simulate sending email
    console.log(`[Email Sent] To: ${newOrder.userEmail}\nSubject: Your Heritage Mist Order #${newOrder.id} is confirmed!\nTransaction ID: ${newOrder.id}`);
    
    res.status(201).json(newOrder);
};

// @desc    Track an order by ID and email
// @route   POST /api/orders/track
// @access  Public
const trackOrder = (req, res) => {
    const { orderId, email } = req.body;
    const order = orders.find(o => o.id.toLowerCase() === orderId.toLowerCase() && o.userEmail.toLowerCase() === email.toLowerCase());

    if (order) {
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Get logged in user's orders
// @route   GET /api/orders/myorders
// @access  Private
const getUserOrders = (req, res) => {
    const userOrders = orders
        .filter(o => o.userEmail.toLowerCase() === req.user.email.toLowerCase())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(userOrders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = (req, res) => {
    const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(sortedOrders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = (req, res) => {
    const orderId = req.params.id;
    const { status } = req.body;

    const order = orders.find(o => o.id === orderId);

    if (order) {
        order.status = status;
        res.json(order);
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
};

// @desc    Check if a user has purchased a specific product
// @route   GET /api/orders/purchase-status/:productId
// @access  Private
const checkPurchaseStatus = (req, res) => {
    const { productId } = req.params;
    const userEmail = req.user.email;

    const hasPurchased = orders.some(order =>
        order.userEmail.toLowerCase() === userEmail.toLowerCase() &&
        order.items.some(item => item.id === Number(productId))
    );

    res.json({ hasPurchased });
};


module.exports = {
    placeOrder,
    trackOrder,
    getUserOrders,
    getAllOrders,
    updateOrderStatus,
    checkPurchaseStatus
};
