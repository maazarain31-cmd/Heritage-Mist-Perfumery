const { reviews, orders } = require('../data');

// @desc    Get reviews for a product
// @route   GET /api/reviews/:productId
// @access  Public
const getReviewsByProduct = (req, res) => {
    const productId = Number(req.params.productId);
    const productReviews = reviews
        .filter(review => review.productId === productId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(productReviews);
};

// @desc    Add a new review for a product
// @route   POST /api/reviews
// @access  Private
const addReview = (req, res) => {
    const { productId, name, rating, comment } = req.body;
    
    // Server-side check to ensure the user has purchased the product
    const hasPurchased = orders.some(order =>
        order.userEmail.toLowerCase() === req.user.email.toLowerCase() &&
        order.items.some(item => item.id === productId)
    );

    if (!hasPurchased) {
        return res.status(403).json({ message: 'You must purchase this product to leave a review.' });
    }

    const newReview = {
        id: `REV-${Date.now().toString(36).toUpperCase()}`,
        productId,
        name,
        rating,
        comment,
        createdAt: new Date().toISOString(),
        userEmail: req.user.email // Associate review with user
    };

    reviews.push(newReview);
    res.status(201).json(newReview);
};

module.exports = { getReviewsByProduct, addReview };
