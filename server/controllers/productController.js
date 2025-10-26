const { products } = require('../data');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = (req, res) => {
    res.json(products);
};

module.exports = { getProducts };
