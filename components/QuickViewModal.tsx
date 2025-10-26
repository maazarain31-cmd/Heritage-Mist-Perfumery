
import React, { useState, useEffect } from 'react';
import type { Product } from '../types';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
  convertPrice: (price: number) => string;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, onAddToCart, convertPrice }) => {
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (product) {
      setSelectedSize(product.availableSizes[0]);
    }
  }, [product]);
  
  if (!product) {
    return null;
  }

  const handleAddToCartClick = () => {
    onAddToCart(product, selectedSize);
    onClose();
  };

  const priceDisplay = convertPrice(product.price);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative flex flex-col md:flex-row overflow-hidden animate-fade-in-up"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'fadeInUp 0.3s ease-out' }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-3xl z-10">&times;</button>
        
        <div className="w-full md:w-1/2 h-64 md:h-auto">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <h2 className="text-3xl font-bold text-gray-900">{product.name}</h2>
          <p className="text-md text-gray-500 mt-1">{product.category}</p>
          <p className="text-2xl font-bold text-gray-800 my-4">{priceDisplay}</p>

          <div className="mt-4">
            <h3 className="text-md font-semibold text-gray-800">Main Accords</h3>
            <p className="text-gray-600 mt-1 text-sm">{product.mainAccords}</p>
          </div>

          <div className="mt-6">
            <span className="text-md font-semibold text-gray-800">Select Size:</span>
            <div className="flex gap-3 mt-2 flex-wrap">
              {product.availableSizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 border rounded-full text-sm font-semibold transition ${selectedSize === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-grow"></div>

          <button
            onClick={handleAddToCartClick}
            disabled={product.stock === 0}
            className="mt-8 w-full py-3 px-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 text-md"
          >
            {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
