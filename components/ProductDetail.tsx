import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Product, User, Review } from '../types';
import { api } from '../services/api';

interface ProductDetailProps {
    products: Product[];
    onAddToCart: (product: Product, size: string) => void;
    convertPrice: (price: number) => string;
    user: User | null;
}

const ImageMagnifier: React.FC<{ src: string, alt: string }> = ({ src, alt }) => {
    const [showMagnifier, setShowMagnifier] = useState(false);
    const [[x, y], setXY] = useState([0, 0]);
    const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

    const magnifierHeight = 200;
    const magnifierWidth = 200;
    const zoomLevel = 2.5;

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        const elem = e.currentTarget;
        const { width, height } = elem.getBoundingClientRect();
        setSize([width, height]);
        setShowMagnifier(true);
    };
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const elem = e.currentTarget;
        const { top, left } = elem.getBoundingClientRect();
        const x = e.pageX - left - window.pageXOffset;
        const y = e.pageY - top - window.pageYOffset;
        setXY([x, y]);
    };

    return (
        <div 
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowMagnifier(false)}
        >
            <img src={src} alt={alt} className="w-full h-auto object-cover rounded-lg shadow-lg" />
            {showMagnifier && (
                <div
                    style={{
                        position: 'absolute',
                        left: `${x - magnifierWidth / 2}px`,
                        top: `${y - magnifierHeight / 2}px`,
                        pointerEvents: 'none',
                        height: `${magnifierHeight}px`,
                        width: `${magnifierWidth}px`,
                        border: '1px solid lightgray',
                        backgroundColor: 'white',
                        backgroundImage: `url('${src}')`,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: `${imgWidth * zoomLevel}px ${imgHeight * zoomLevel}px`,
                        backgroundPositionX: `${-x * zoomLevel + magnifierWidth / 2}px`,
                        backgroundPositionY: `${-y * zoomLevel + magnifierHeight / 2}px`,
                        borderRadius: '50%',
                    }}
                ></div>
            )}
        </div>
    );
};

const StarRating: React.FC<{ rating: number; onRatingChange?: (rating: number) => void }> = ({ rating, onRatingChange }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    className={`w-6 h-6 cursor-${onRatingChange ? 'pointer' : 'default'} ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    onClick={() => onRatingChange?.(star)}
                    aria-label={`${star} star`}
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};

export const ProductDetail: React.FC<ProductDetailProps> = ({ products, onAddToCart, convertPrice, user }) => {
    const { productId } = useParams<{ productId: string }>();
    const product = products.find(p => p.id === Number(productId));
    
    const [size, setSize] = useState('');
    const [reviews, setReviews] = useState<Review[]>([]);
    const [userHasPurchased, setUserHasPurchased] = useState(false);
    
    const [reviewName, setReviewName] = useState('');
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (product) {
            setSize(product.availableSizes[0]);
            
            const fetchReviewData = async () => {
                try {
                    setReviews(await api.getReviews(product.id));
                    if (user) {
                        setUserHasPurchased(await api.hasPurchased(product.id));
                        setReviewName(user.email.split('@')[0]);
                    } else {
                        setUserHasPurchased(false);
                    }
                } catch (error) {
                    console.error("Failed to fetch review data:", error);
                }
            };
            fetchReviewData();
        }
    }, [product, user]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (reviewRating === 0 || !reviewName.trim() || !reviewComment.trim()) {
            setReviewError('Please provide a name, rating, and comment.');
            return;
        }
        if (!product) return;
        
        setReviewError('');
        setIsSubmittingReview(true);
        
        try {
            await api.addReview({
                productId: product.id,
                name: reviewName,
                rating: reviewRating,
                comment: reviewComment,
            });
            setReviewRating(0);
            setReviewComment('');
            // Refetch reviews to show the new one
            setReviews(await api.getReviews(product.id));
        } catch (err: any) {
            setReviewError(err.message || 'Failed to submit review.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (!product) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold">Product Not Found</h1>
                <p className="text-gray-600 mt-4">We couldn't find the product you're looking for.</p>
                <Link to="/" className="mt-8 inline-block px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition">
                    Back to Shop
                </Link>
            </div>
        );
    }
    
    const priceDisplay = convertPrice(product.price);
    const averageRating = reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : 0;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-6">
                <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">&larr; Back to Shop</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="cursor-crosshair">
                    <ImageMagnifier src={product.img} alt={product.name} />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
                    <p className="text-lg text-gray-500 mt-2">{product.category}</p>
                    {reviews.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                           <StarRating rating={averageRating} />
                           <span className="text-gray-600">({reviews.length} reviews)</span>
                        </div>
                    )}
                    <p className="text-3xl font-bold text-gray-800 my-4">{priceDisplay}</p>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800">Main Accords</h3>
                        <p className="text-gray-600 mt-1">{product.mainAccords}</p>
                    </div>

                    <div className="mt-6">
                        <span className="text-lg font-semibold text-gray-800">Select Size:</span>
                        <div className="flex gap-3 mt-2 flex-wrap">
                            {product.availableSizes.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setSize(s)}
                                    className={`px-4 py-2 border rounded-full text-md font-semibold transition ${size === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <button
                        onClick={() => onAddToCart(product, size)}
                        disabled={product.stock === 0}
                        className="mt-8 w-full py-4 px-6 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-300 text-lg"
                    >
                        {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                </div>
            </div>

            <div className="mt-16 pt-10 border-t">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
                
                {user && userHasPurchased && (
                    <div className="bg-white p-6 rounded-lg shadow-md mb-10">
                        <h3 className="text-xl font-semibold mb-4">Leave a Review</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="reviewName" className="block text-sm font-medium text-gray-700">Your Name</label>
                                <input type="text" id="reviewName" value={reviewName} onChange={e => setReviewName(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Rating</label>
                                <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
                            </div>
                            <div>
                                <label htmlFor="reviewComment" className="block text-sm font-medium text-gray-700">Comment</label>
                                <textarea id="reviewComment" rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="mt-1 w-full p-2 border rounded-md" required />
                            </div>
                            {reviewError && <p className="text-red-500 text-sm">{reviewError}</p>}
                            <button type="submit" disabled={isSubmittingReview} className="px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400">
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </button>
                        </form>
                    </div>
                )}
                
                {user && !userHasPurchased && (
                     <div className="bg-gray-100 p-4 rounded-lg mb-10 text-center">
                        <p className="text-gray-600">You must purchase this product to leave a review.</p>
                     </div>
                )}
                
                {reviews.length > 0 ? (
                    <div className="space-y-8">
                        {reviews.map(review => (
                            <div key={review.id} className="border-b pb-6 last:border-b-0">
                                <div className="flex items-center mb-2">
                                    <h4 className="font-semibold text-lg mr-4">{review.name}</h4>
                                    <StarRating rating={review.rating} />
                                </div>
                                <p className="text-gray-500 text-sm mb-3">
                                    {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">Be the first to review this product.</p>
                )}
            </div>
        </div>
    );
};
