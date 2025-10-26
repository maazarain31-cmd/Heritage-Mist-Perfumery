import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { User, CountryCode, Product } from '../types';
import { currencies } from '../App';

interface SearchBarProps {
    products: Product[];
}

const SearchBar: React.FC<SearchBarProps> = ({ products }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Product[]>([]);
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (query.trim().length > 0) {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(query.toLowerCase())
            );
            setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions for a cleaner UI
        } else {
            setSuggestions([]);
        }
    }, [query, products]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
    };
    
    const handleSuggestionClick = (product: Product) => {
        setQuery(product.name);
        setIsFocused(false);
        navigate(`/product/${product.id}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsFocused(false);
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            navigate(`/?q=${encodeURIComponent(trimmedQuery)}`);
        } else {
            navigate('/');
        }
        setQuery('');
    };

    const getHighlightedText = (text: string, highlight: string) => {
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <strong key={i} className="font-bold text-gray-900">{part}</strong>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="relative w-full max-w-sm" ref={searchContainerRef}>
            <form onSubmit={handleSubmit} className="relative">
                <input
                    type="text"
                    placeholder="Search for your signature scent..."
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsFocused(true)}
                    className="w-full px-4 py-2 text-base bg-gray-800 text-white border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition"
                />
                <button type="submit" aria-label="Search" className="absolute w-6 h-6 text-gray-400 right-4 top-1/2 -translate-y-1/2">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </button>
            </form>
            {isFocused && query.length > 0 && (
                <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        <ul>
                            {suggestions.map(product => (
                                <li
                                    key={product.id}
                                    className="p-3 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                    onMouseDown={() => handleSuggestionClick(product)}
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={product.img} alt={product.name} className="w-10 h-10 object-cover rounded" />
                                        <span className="text-gray-700 text-sm">
                                            {getHighlightedText(product.name, query)}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="p-3 text-sm text-gray-500 text-center">No results found.</div>
                    )}
                </div>
            )}
        </div>
    );
};


interface HeaderProps {
    user: User | null;
    onLogout: () => void;
    onCartClick: () => void;
    totalCartItems: number;
    onAuthClick: () => void;
    country: CountryCode;
    onCountryChange: (countryCode: CountryCode) => void;
    onShowInfo: (title: string, content: React.ReactNode) => void;
    products: Product[];
}

const ANNOUNCEMENTS = [
    "WELCOME TO HERITAGE MIST",
    "ENJOY FREE SHIPPING ON ORDERS ABOVE 3000 PKR"
];

const CartIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const NavDropdown: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
            <button className="text-white hover:text-gray-300 font-medium transition-colors py-2">{title}</button>
            {isOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-1 p-2 w-48 bg-white rounded-md shadow-lg z-20">
                    {children}
                </div>
            )}
        </div>
    );
};
const NavDropdownItem: React.FC<{ to?: string, children: React.ReactNode, onClick?: () => void }> = ({ to, children, onClick }) => {
    const content = <div onClick={onClick} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-3 cursor-pointer">{children}</div>;
    return to ? <Link to={to}>{content}</Link> : <button className="w-full">{content}</button>;
};


export const Header: React.FC<HeaderProps> = ({ user, onLogout, onCartClick, totalCartItems, onAuthClick, country, onCountryChange, onShowInfo, products }) => {
    const [isLogoZoomed, setIsLogoZoomed] = useState(false);
    const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(ANNOUNCEMENTS[0]);

     useEffect(() => {
        let index = 0;
        const intervalId = setInterval(() => {
            index = (index + 1) % ANNOUNCEMENTS.length;
            setCurrentAnnouncement(ANNOUNCEMENTS[index]);
        }, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const handleLogoClick = () => {
        if (isLogoZoomed) return;
        setIsLogoZoomed(true);
        setTimeout(() => setIsLogoZoomed(false), 300);
    };

    const handleCountrySelect = (code: CountryCode) => {
        onCountryChange(code);
        setIsCountryDropdownOpen(false);
    };

    const ourStoryContent = (
      <div className="space-y-4 text-gray-700 text-left">
        <p>Born from a passion for timeless scents, Heritage Mist is more than a perfumery—it's a celebration of memory, emotion, and artistry. Our journey began in a small workshop, with a dream to capture the essence of nature's most enchanting aromas.</p>
        <p>We believe that a fragrance is a personal signature, a whisper of individuality. Each bottle we craft is a story waiting to be told, blending traditional techniques with contemporary elegance. We invite you to explore our collection and find the scent that tells your story.</p>
      </div>
    );

    const ourIngredientsContent = (
      <div className="space-y-4 text-gray-700 text-left">
        <p>At Heritage Mist, we are committed to excellence and purity. We travel the globe to source the finest, ethically-harvested ingredients. From the rare Oud of Southeast Asian forests to the delicate Rose de Mai from Grasse, every element is chosen for its quality and character.</p>
        <p>Our master perfumers artfully blend these precious raw materials, creating complex and harmonious compositions that evolve on the skin. We are dedicated to transparency and sustainability, ensuring that every bottle is a testament to nature's beauty and our respect for it.</p>
      </div>
    );

    return (
        <header className="shadow-md sticky top-0 z-40">
            <div className="bg-black text-white text-center py-2 text-sm font-medium transition-all duration-500">
                {currentAnnouncement}
            </div>
            <div className="bg-gray-900 text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex-1 flex justify-start">
                             <SearchBar products={products} />
                        </div>

                        <div className="flex-1 flex justify-center">
                            <Link to="/" className="flex flex-col items-center">
                                <img
                                    src="/images/logo.png"
                                    alt="HeritageMist Logo"
                                    className={`object-cover border-2 border-gray-300 rounded-full h-14 w-14 cursor-pointer transition-transform duration-300 ease-in-out ${isLogoZoomed ? "scale-125" : "scale-100"}`}
                                    onClick={handleLogoClick}
                                />
                                <span className="mt-1 text-xl font-semibold tracking-wider text-white uppercase">Heritage Mist</span>
                            </Link>
                        </div>

                        <div className="flex items-center justify-end flex-1 space-x-4">
                             <div className="relative">
                                <button onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)} className="flex items-center gap-2 font-medium text-white hover:text-gray-300 transition-colors">
                                    <span className="text-2xl">{currencies[country].flag}</span>
                                    <span>{currencies[country].code}</span>
                                </button>
                                {isCountryDropdownOpen && (
                                    <div className="absolute right-0 mt-2 p-2 w-48 bg-white rounded-md shadow-lg z-10">
                                        {Object.entries(currencies).map(([code, details]) => (
                                            <button key={code} onClick={() => handleCountrySelect(code as CountryCode)} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-3">
                                                <span className="text-2xl">{details.flag}</span>
                                                <span>{details.name} ({details.code})</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {user ? (
                                <div className="relative group">
                                    <button className="font-medium text-white hover:text-gray-300 transition-colors py-2">{user.email.split('@')[0]}</button>
                                    <div className="absolute right-0 mt-1 p-2 w-40 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                                        <Link to="/account" className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                                            My Account
                                        </Link>
                                        <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={onAuthClick} className="font-medium text-white hover:text-gray-300 transition-colors">
                                    Sign In
                                </button>
                            )}
                            <button onClick={onCartClick} className="relative text-white hover:text-gray-300 transition-colors" aria-label={`Shopping cart with ${totalCartItems} items`}>
                                <CartIcon />
                                {totalCartItems > 0 && (
                                    <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs text-white bg-red-600 rounded-full">{totalCartItems}</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-black text-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <nav className="flex items-center justify-center h-12 space-x-8">
                        <NavDropdown title="About">
                            <NavDropdownItem onClick={() => onShowInfo("Our Story", ourStoryContent)}>Our Story</NavDropdownItem>
                            <NavDropdownItem onClick={() => onShowInfo("Our Ingredients", ourIngredientsContent)}>Our Ingredients</NavDropdownItem>
                        </NavDropdown>
                        <NavDropdown title="Contact">
                                <NavDropdownItem>Review Suggestion</NavDropdownItem>
                            <NavDropdownItem to="/tracking">Track Order</NavDropdownItem>
                            <NavDropdownItem>Returns & Refunds</NavDropdownItem>
                        </NavDropdown>
                            <NavDropdown title="Gifting">
                            <NavDropdownItem>For Wife</NavDropdownItem>
                            <NavDropdownItem>For Mom</NavDropdownItem>
                            <NavDropdownItem>For Sister</NavDropdownItem>
                            <NavDropdownItem>For Friend</NavDropdownItem>
                        </NavDropdown>
                        <NavDropdown title="Shop">
                            <NavDropdownItem>Gender</NavDropdownItem>
                            <NavDropdownItem>Types</NavDropdownItem>
                            <NavDropdownItem>Elite Fragrances</NavDropdownItem>
                            <NavDropdownItem>Range</NavDropdownItem>
                        </NavDropdown>
                    </nav>
                </div>
            </div>
        </header>
    );
};