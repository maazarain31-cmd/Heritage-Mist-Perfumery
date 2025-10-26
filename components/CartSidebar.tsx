import React from 'react';
import type { CartItem } from '../types';
import { Link, useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (productId: number, size: string, delta: number) => void;
  onClearCart: () => void;
  onCheckout: () => void;
  isLoggedIn: boolean;
  convertPrice: (price: number) => string;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose, cart, onUpdateQuantity, onClearCart, onCheckout, isLoggedIn, convertPrice }) => {
  const navigate = useNavigate();
  const subtotalInPkr = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotalDisplay = convertPrice(subtotalInPkr);

  const handleCheckoutClick = () => {
    if (isLoggedIn) {
      navigate('/checkout');
      onClose();
    } else {
      onCheckout();
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">Shopping Cart</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
          </div>

          {cart.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
              <p className="text-gray-500">Your cart is empty.</p>
              <button onClick={onClose} className="mt-4 px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {cart.map(item => (
                  <div key={`${item.id}-${item.size}`} className="flex items-start gap-4">
                    <img src={item.img} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-grow">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-gray-500">Size: {item.size}</p>
                      <p className="text-sm font-medium">{convertPrice(item.price)}</p>
                      <div className="flex items-center mt-2 border rounded-md w-max">
                        <button onClick={() => onUpdateQuantity(item.id, item.size, -1)} className="px-3 py-1 text-lg">-</button>
                        <span className="px-3 py-1">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.size, 1)} className="px-3 py-1 text-lg">+</button>
                      </div>
                    </div>
                    <button onClick={() => onUpdateQuantity(item.id, item.size, -item.quantity)} className="text-gray-400 hover:text-red-500 text-xs">Remove</button>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t space-y-4">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>{subtotalDisplay}</span>
                </div>
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-700 transition"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={onClearCart}
                  className="w-full py-2 text-red-600 font-semibold rounded-lg hover:bg-red-50 transition"
                >
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};