import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { QuickViewModal } from './QuickViewModal';

interface HomeProps {
    products: Product[];
    onAddToCart: (product: Product, size: string) => void;
    convertPrice: (price: number) => string;
}

interface Filters {
    selectedCategories: string[];
    selectedAccords: string[];
    selectedSizes: string[];
    maxPrice: number;
}

const FilterSidebar: React.FC<{
    products: Product[],
    filters: Filters,
    onFilterChange: (filters: Filters) => void,
    convertPrice: (price: number) => string,
}> = ({ products, filters, onFilterChange, convertPrice }) => {
    
    const maxProductPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);

    const allCategories = useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
    const allAccords = useMemo(() => {
        const accords = products.flatMap(p => p.mainAccords.split(',').map(a => a.trim()));
        return Array.from(new Set(accords));
    }, [products]);
    const allSizes = useMemo(() => {
        const sizes = products.flatMap(p => p.availableSizes);
        return Array.from(new Set(sizes)).sort((a,b) => parseInt(a) - parseInt(b));
    }, [products]);

    const handleFilterChange = (type: keyof Filters, value: string | number) => {
        const newFilters = { ...filters };
        
        if (type === 'selectedCategories' || type === 'selectedAccords' || type === 'selectedSizes') {
            const currentValues = newFilters[type] as string[];
            const stringValue = value as string;
            const updatedValues = currentValues.includes(stringValue)
                ? currentValues.filter(item => item !== stringValue)
                : [...currentValues, stringValue];
            (newFilters[type] as string[]) = updatedValues;
        } else if (type === 'maxPrice') {
            newFilters.maxPrice = value as number;
        }
        
        onFilterChange(newFilters);
    };

    const FilterSection: React.FC<{title: string, items: string[], onSelect: (item: string) => void, selectedItems: string[]}> = ({ title, items, onSelect, selectedItems }) => (
        <div className="py-4 border-b">
            <h3 className="font-semibold mb-2">{title}</h3>
            <div className="space-y-2">
                {items.map(item => (
                    <label key={item} className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={selectedItems.includes(item)} onChange={() => onSelect(item)} className="h-4 w-4 rounded border-gray-300 text-gray-800 focus:ring-gray-700"/>
                        <span className="ml-3 text-sm text-gray-600">{item}</span>
                    </label>
                ))}
            </div>
        </div>
    );
    
    return (
        <aside className="w-full lg:w-1/4 xl:w-1/5 p-4 bg-white shadow-md rounded-lg h-min">
            <h2 className="text-xl font-bold mb-4">Filters</h2>
            <FilterSection title="Fragrance For" items={allCategories} onSelect={(item) => handleFilterChange('selectedCategories', item)} selectedItems={filters.selectedCategories} />
            
            <div className="py-4 border-b">
                <h3 className="font-semibold mb-2">Price Range</h3>
                <input 
                    type="range"
                    min="0"
                    max={maxProductPrice}
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>{convertPrice(0)}</span>
                    <span>{convertPrice(filters.maxPrice)}</span>
                </div>
            </div>

            <FilterSection title="Fragrance Type" items={allAccords} onSelect={(item) => handleFilterChange('selectedAccords', item)} selectedItems={filters.selectedAccords} />
            <FilterSection title="Size" items={allSizes} onSelect={(item) => handleFilterChange('selectedSizes', item)} selectedItems={filters.selectedSizes} />
        </aside>
    );
};

export const Home: React.FC<HomeProps> = ({ products, onAddToCart, convertPrice }) => {
    const location = useLocation();
    const [filterQuery, setFilterQuery] = useState('');
    const [view, setView] = useState<'grid' | 'list'>('list');
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [sortOption, setSortOption] = useState('default');
    
    const maxPrice = useMemo(() => Math.max(...products.map(p => p.price), 0), [products]);

    const [filters, setFilters] = useState<Filters>(() => {
        try {
            const savedFilters = localStorage.getItem('perfumeFilters');
            if (savedFilters) {
                return JSON.parse(savedFilters);
            }
        } catch (e) {
            console.error("Failed to parse filters from localStorage", e);
        }
        return {
            selectedCategories: [],
            selectedAccords: [],
            selectedSizes: [],
            maxPrice: 0, // Will be updated by an effect once products are loaded.
        };
    });

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setFilterQuery(params.get('q') || '');
    }, [location.search]);


    useEffect(() => {
        // When the actual max price is calculated, update the filter state.
        // This ensures the slider always starts at the maximum value on page load.
        if (maxPrice > 0) {
            setFilters(f => ({ ...f, maxPrice: maxPrice }));
        }
    }, [maxPrice]);

    useEffect(() => {
        try {
            localStorage.setItem('perfumeFilters', JSON.stringify(filters));
        } catch (e) {
            console.error("Failed to save filters to localStorage", e);
        }
    }, [filters]);

    const filteredProducts = useMemo(() => {
        let processedProducts = products.filter(p => {
            const searchMatch = p.name.toLowerCase().includes(filterQuery.toLowerCase());
            const categoryMatch = filters.selectedCategories.length === 0 || filters.selectedCategories.includes(p.category);
            const accordMatch = filters.selectedAccords.length === 0 || filters.selectedAccords.some(accord => p.mainAccords.includes(accord));
            const sizeMatch = filters.selectedSizes.length === 0 || filters.selectedSizes.some(size => p.availableSizes.includes(size));
            const priceMatch = p.price <= filters.maxPrice;
            return searchMatch && categoryMatch && accordMatch && sizeMatch && priceMatch;
        });

        const sortedProducts = [...processedProducts];

        switch (sortOption) {
            case 'price-asc':
                sortedProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sortedProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'default':
            default:
                break;
        }
        
        return sortedProducts;
    }, [products, filterQuery, filters, sortOption]);

    const handleOpenQuickView = (product: Product) => {
        setQuickViewProduct(product);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                <FilterSidebar products={products} filters={filters} onFilterChange={setFilters} convertPrice={convertPrice} />
                <main className="w-full lg:flex-grow">
                     {filterQuery && (
                        <div className="mb-6 pb-4 border-b">
                            <h2 className="text-2xl font-semibold">
                                Showing results for: <span className="text-gray-800 font-bold">"{filterQuery}"</span>
                            </h2>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <span className="text-gray-600">{filteredProducts.length} Products Found</span>
                        <div className="flex items-center gap-4">
                            <div>
                                <label htmlFor="sort-products" className="sr-only">Sort products</label>
                                <select 
                                    id="sort-products"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                    className="bg-white block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm rounded-md"
                                >
                                    <option value="default">Default</option>
                                    <option value="name-asc">Name: A to Z</option>
                                    <option value="name-desc">Name: Z to A</option>
                                    <option value="price-asc">Price: Low to High</option>
                                    <option value="price-desc">Price: High to Low</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setView('grid')} className={`p-2 rounded-md transition ${view === 'grid' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button onClick={() => setView('list')} className={`p-2 rounded-md transition ${view === 'list' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'flex flex-col gap-4'}>
                        {filteredProducts.map(product => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onAddToCart={onAddToCart} 
                                convertPrice={convertPrice} 
                                view={view}
                                onQuickView={handleOpenQuickView}
                             />
                        ))}
                    </div>
                </main>
            </div>
            <QuickViewModal 
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={onAddToCart}
                convertPrice={convertPrice}
            />
        </div>
    );
};