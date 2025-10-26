
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, size: string) => void;
  convertPrice: (price: number) => string;
  view: 'grid' | 'list';
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, convertPrice, view, onQuickView }) => {
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0]);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleAddToCartWrapper = (e: React.MouseEvent) => {
    handleActionClick(e);
    onAddToCart(product, selectedSize);
  }

  const handleQuickViewClick = (e: React.MouseEvent) => {
      handleActionClick(e);
      onQuickView(product);
  }

  const priceDisplay = convertPrice(product.price);

  if (view === 'list') {
    return (
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl group cursor-pointer flex flex-row w-full"
        onClick={handleCardClick}
      >
        <div className="relative w-1/3">
          <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button 
                  onClick={handleQuickViewClick}
                  className="bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 transition"
              >
                  Quick View
              </button>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-grow w-2/3">
          <h3 className="text-xl font-semibold text-gray-900 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.category}</p>
          <p className="text-lg font-bold text-gray-800 mt-2">{priceDisplay}</p>
          <p className="text-sm text-gray-500 mt-2">
              <span className="font-medium text-gray-700">Main Accords:</span> {product.mainAccords}
          </p>
          <div className="flex-grow"></div>
          <div className="flex items-end gap-4 mt-4" onClick={handleActionClick}>
            <div className="flex-grow">
              <span className="text-sm font-medium text-gray-700">Size:</span>
              <div className="flex gap-2 mt-1 flex-wrap">
                  {product.availableSizes.map(size => (
                      <button key={size} onClick={(e) => { e.stopPropagation(); setSelectedSize(size);}} className={`px-3 py-1 border rounded-full text-xs font-semibold transition ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}>
                          {size}
                      </button>
                  ))}
              </div>
            </div>
            <button
              onClick={handleAddToCartWrapper}
              disabled={product.stock === 0}
              className="py-2 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 whitespace-nowrap"
            >
              {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 group cursor-pointer flex flex-col"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img src={product.img} alt={product.name} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-40 transition-all duration-300"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button 
                onClick={handleQuickViewClick}
                className="bg-white text-gray-900 font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-gray-200 transition"
            >
                Quick View
            </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500">{product.category}</p>
        <p className="text-lg font-bold text-gray-800 mt-2">{priceDisplay}</p>
        
        <div className="mt-4" onClick={handleActionClick}>
            <span className="text-sm font-medium text-gray-700">Size:</span>
            <div className="flex gap-2 mt-1 flex-wrap">
                {product.availableSizes.map(size => (
                    <button 
                        key={size} 
                        onClick={(e) => {e.stopPropagation(); setSelectedSize(size);}}
                        className={`px-3 py-1 border rounded-full text-sm font-semibold transition ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                    >
                        {size}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="flex-grow"></div>

        <button
          onClick={handleAddToCartWrapper}
          disabled={product.stock === 0}
          className="mt-4 w-full py-2 px-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
        </button>

        <div className="mt-4 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
                <span className="font-medium text-gray-700">Main Accords:</span> {product.mainAccords}
            </p>
        </div>
      </div>
    </div>
  );
};
