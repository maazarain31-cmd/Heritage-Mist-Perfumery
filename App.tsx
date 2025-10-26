import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home } from './components/Home';
import { Checkout } from './components/Checkout';
import { Tracking } from './components/Tracking';
import { Admin } from './components/Admin';
import { Account } from './components/Account';
import { CartSidebar } from './components/CartSidebar';
import { AuthModal } from './components/AuthModal';
import { Header } from './components/Header';
import { OrderSuccess } from './components/OrderSuccess';
import { ProductDetail } from './components/ProductDetail';
import { InfoModal } from './components/InfoModal';
import { api } from './services/api';
import type { CartItem, User, Order, Product, CountryCode } from './types';

export const currencies = {
  PK: { name: 'Pakistan', code: 'PKR', symbol: '₨', rate: 1, flag: '🇵🇰' },
  GB: { name: 'United Kingdom', code: 'GBP', symbol: '£', rate: 0.0028, flag: '🇬🇧' },
  US: { name: 'United States', code: 'USD', symbol: '$', rate: 0.0036, flag: '🇺🇸' },
  SA: { name: 'Saudi Arabia', code: 'SAR', symbol: 'SR', rate: 0.013, flag: '🇸🇦' },
  AE: { name: 'UAE', code: 'AED', symbol: 'AED', rate: 0.013, flag: '🇦🇪' },
  IN: { name: 'India', code: 'INR', symbol: '₹', rate: 0.30, flag: '🇮🇳' },
  CA: { name: 'Canada', code: 'CAD', symbol: '$', rate: 0.0049, flag: '🇨🇦' },
};

const mockProducts: Product[] = [
    { id: 1, name: "Urban Wood (Sample)", price: 1500, img: "/images/urban-wood.jpg", stock: 10, category: "For Men", mainAccords: "Woody, Spicy, Aromatic", availableSizes: ["10ml", "50ml", "100ml"] },
    { id: 2, name: "Rose Bloom (Sample)", price: 2500, img: "/images/rose-bloom.jpg", stock: 8, category: "For Women", mainAccords: "Floral, Sweet, Rose", availableSizes: ["50ml", "100ml", "200ml"] },
    { id: 3, name: "Floral Essence (Sample)", price: 2000, img: "/images/floral-essence.jpg", stock: 5, category: "Unisex", mainAccords: "Fresh, Light, White Floral", availableSizes: ["10ml", "50ml", "100ml"] },
    { id: 4, name: "Citrus Fresh (Sample)", price: 1800, img: "/images/citrus-fresh.jpg", stock: 12, category: "For Women", mainAccords: "Citrus, Fresh, Green", availableSizes: ["50ml", "100ml"] },
    { id: 5, name: "Oud Majestic (Sample)", price: 4500, img: "/images/oud-majestic.jpg", stock: 7, category: "For Men", mainAccords: "Oud, Woody, Amber", availableSizes: ["50ml", "100ml"] },
    { id: 6, name: "Ocean Breeze (Sample)", price: 1200, img: "/images/ocean-breeze.jpg", stock: 15, category: "Unisex", mainAccords: "Aquatic, Fresh, Citrus", availableSizes: ["10ml", "50ml", "100ml", "200ml"] },
];

function AppContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [country, setCountry] = useState<CountryCode>(() => {
    return (localStorage.getItem('countryCode') as CountryCode) || 'PK';
  });
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [infoModalContent, setInfoModalContent] = useState<{title: string, content: React.ReactNode} | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [serverWarning, setServerWarning] = useState<string | null>(null);

  const navigate = useNavigate();
  
  const handleShowInfoModal = (title: string, content: React.ReactNode) => {
    setInfoModalContent({ title, content });
    setIsInfoModalOpen(true);
  };

  const fetchInitialData = useCallback(async () => {
    setIsLoading(true);
    setServerWarning(null);
    try {
        const fetchedProducts = await api.getProducts();
        setProducts(fetchedProducts);

        const storedUser = await api.getCurrentUser();
        if (storedUser) {
            setCurrentUser(storedUser);
            if (storedUser.isAdmin) {
                setIsAdminLoggedIn(true);
            }
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
             console.warn("--- DEVELOPMENT WARNING --- \nFailed to fetch initial data. Is the backend server running on port 5001?\nFalling back to mock data. To run the server: \n1. Open a new terminal\n2. cd server\n3. node server.js\n--------------------------", error);
             setServerWarning("Connection Error: Could not connect to the backend. Displaying sample data. Please start the server and refresh the page for full functionality.");
             setProducts(mockProducts);
        } else {
            console.error("Failed to fetch initial data:", error);
            setServerWarning(`An unexpected error occurred: ${(error as Error).message}. Some features may not work correctly.`);
        }
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);


  useEffect(() => {
    localStorage.setItem('countryCode', country);
  }, [country]);

  const convertPrice = (priceInPkr: number) => {
    const selectedCurrency = currencies[country];
    const converted = priceInPkr * selectedCurrency.rate;
    return `${selectedCurrency.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const addToCart = (product: Product, size: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: number, size: string, delta: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.id === productId && item.size === size) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    navigate('/');
  };
  
  const handleLoginSuccess = (user: User) => {
    setIsAuthModalOpen(false);
    if (user.isAdmin) {
      setIsAdminLoggedIn(true);
      setCurrentUser(user);
      navigate('/admin');
    } else {
      setCurrentUser(user);
    }
  };

  const handleAdminLogout = () => {
      api.logout();
      setCurrentUser(null);
      setIsAdminLoggedIn(false);
      navigate('/');
  };

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <svg className="animate-spin h-10 w-10 text-gray-800 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <h2 className="text-xl font-semibold text-gray-700">Loading Heritage Mist...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 text-gray-800">
      {serverWarning && (
        <div role="alert" className="bg-yellow-400 text-yellow-900 text-center p-3 font-semibold text-sm shadow-md">
          <p>{serverWarning}</p>
        </div>
      )}
      <Header 
        user={currentUser} 
        onLogout={handleLogout}
        onCartClick={() => setIsCartOpen(true)}
        totalCartItems={totalCartItems}
        onAuthClick={() => {
            if (serverWarning) {
                alert('Authentication is disabled while the backend is disconnected.');
                return;
            }
            setIsAuthModalOpen(true)
        }}
        country={country}
        onCountryChange={setCountry}
        onShowInfo={handleShowInfoModal}
        products={products}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home products={products} onAddToCart={addToCart} convertPrice={convertPrice} />} />
          <Route path="/product/:productId" element={<ProductDetail products={products} onAddToCart={addToCart} convertPrice={convertPrice} user={currentUser} />} />
          <Route path="/checkout" element={<Checkout cart={cart} user={currentUser} setLastOrder={setLastOrder} clearCart={clearCart} convertPrice={convertPrice} />} />
          <Route path="/tracking" element={<Tracking />} />
           <Route path="/account" element={
              currentUser ? <Account user={currentUser} convertPrice={convertPrice} /> : <Navigate to="/" replace />
          } />
          <Route path="/admin" element={
              isAdminLoggedIn ? <Admin onLogout={handleAdminLogout} /> : <Navigate to="/" replace />
          } />
          <Route path="/order-success" element={<OrderSuccess order={lastOrder} />} />
        </Routes>
      </main>
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateCartQuantity}
        onClearCart={clearCart}
        onCheckout={() => {
          if (serverWarning) {
                alert('Checkout is disabled while the backend is disconnected.');
                return;
            }
          if (!currentUser) {
            setIsAuthModalOpen(true);
          }
        }}
        isLoggedIn={!!currentUser}
        convertPrice={convertPrice}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title={infoModalContent?.title || ''}
      >
        {infoModalContent?.content}
      </InfoModal>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}