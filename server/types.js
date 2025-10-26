const OrderStatus = {
  Packing: 'Packing',
  Shipped: 'Shipped',
  Delivered: 'Delivered',
  PaymentVerification: 'Payment Verification'
};

const PaymentMethod = {
    COD: 'Cash on Delivery',
    Online: 'Online'
};

module.exports = { OrderStatus, PaymentMethod };
