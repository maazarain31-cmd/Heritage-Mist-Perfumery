const bcrypt = require('bcryptjs');
const { OrderStatus, PaymentMethod } = require('./types');

// --- INITIAL DATA ---
const initialProducts = [
    { id: 1, name: "Urban Wood", price: 1500, img: "/images/urban-wood.jpg", stock: 10, category: "For Men", mainAccords: "Woody, Spicy, Aromatic", availableSizes: ["10ml", "50ml", "100ml"] },
    { id: 2, name: "Rose Bloom", price: 2500, img: "/images/rose-bloom.jpg", stock: 8, category: "For Women", mainAccords: "Floral, Sweet, Rose", availableSizes: ["50ml", "100ml", "200ml"] },
    { id: 3, name: "Floral Essence", price: 2000, img: "/images/floral-essence.jpg", stock: 5, category: "Unisex", mainAccords: "Fresh, Light, White Floral", availableSizes: ["10ml", "50ml", "100ml"] },
    { id: 4, name: "Citrus Fresh", price: 1800, img: "/images/citrus-fresh.jpg", stock: 12, category: "For Women", mainAccords: "Citrus, Fresh, Green", availableSizes: ["50ml", "100ml"] },
    { id: 5, name: "Oud Majestic", price: 4500, img: "/images/oud-majestic.jpg", stock: 7, category: "For Men", mainAccords: "Oud, Woody, Amber", availableSizes: ["50ml", "100ml"] },
    { id: 6, name: "Ocean Breeze", price: 1200, img: "/images/ocean-breeze.jpg", stock: 15, category: "Unisex", mainAccords: "Aquatic, Fresh, Citrus", availableSizes: ["10ml", "50ml", "100ml", "200ml"] },
    { id: 7, name: "Vanilla Dream", price: 2200, img: "/images/vanilla-dream.jpg", stock: 9, category: "For Women", mainAccords: "Sweet, Vanilla, Powdery", availableSizes: ["50ml", "100ml"] },
    { id: 8, name: "Leather Intense", price: 3800, img: "/images/leather-intense.jpg", stock: 4, category: "For Men", mainAccords: "Leather, Smoky, Woody", availableSizes: ["100ml", "200ml"] },
];

// --- "DATABASE" ---
let products = [...initialProducts];
let users = [
    // Pre-seed an admin user for convenience
    { email: 'heritagemist.official@gmail.com', passwordHash: bcrypt.hashSync('admin123', 10), isAdmin: true }
];
let orders = [];
let reviews = [];


module.exports = {
    products,
    users,
    orders,
    reviews
};
