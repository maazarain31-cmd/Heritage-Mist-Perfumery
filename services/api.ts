import type { User, Order, Product, Review, OrderStatus } from '../types';

const API_URL = "https://heritage-mist-backend.onrender.com/api";


const getAuthToken = (): string | null => localStorage.getItem('authToken');

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred with the API request.');
    }

    // Handle responses that might not have a JSON body (e.g., 204 No Content)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    }
    return;
};


export const api = {
    getProducts: async (): Promise<Product[]> => {
        return fetchWithAuth(`${API_URL}/products`);
    },

    register: async (email: string, password: string): Promise<{ user: User, token: string }> => {
        const data = await fetchWithAuth(`${API_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        return data;
    },

    login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
        const data = await fetchWithAuth(`${API_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        if (data.token) {
            localStorage.setItem('authToken', data.token);
        }
        return data;
    },

    logout: (): void => {
        localStorage.removeItem('authToken');
    },

    getCurrentUser: async (): Promise<User | null> => {
        if (!getAuthToken()) {
            return null;
        }
        try {
            return await fetchWithAuth(`${API_URL}/auth/me`);
        } catch (error) {
            console.error("Session expired or invalid.", error);
            api.logout(); // Clear bad token
            return null;
        }
    },

    placeOrder: async (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'userEmail'>): Promise<Order> => {
        return fetchWithAuth(`${API_URL}/orders`, {
            method: 'POST',
            body: JSON.stringify(orderData),
        });
    },

    trackOrder: async (orderId: string, email: string): Promise<Order> => {
        return fetchWithAuth(`${API_URL}/orders/track`, {
            method: 'POST',
            body: JSON.stringify({ orderId, email }),
        });
    },

    getOrdersByUser: async (): Promise<Order[]> => {
        return fetchWithAuth(`${API_URL}/orders/myorders`);
    },
    
    getAllOrders: async (): Promise<Order[]> => {
        return fetchWithAuth(`${API_URL}/orders`);
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
        return fetchWithAuth(`${API_URL}/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },
    
    getReviews: async (productId: number): Promise<Review[]> => {
        return fetchWithAuth(`${API_URL}/reviews/${productId}`);
    },

    addReview: async (reviewData: Omit<Review, 'id' | 'createdAt'>): Promise<Review> => {
        return fetchWithAuth(`${API_URL}/reviews`, {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    },

    hasPurchased: async (productId: number): Promise<boolean> => {
         if (!getAuthToken()) {
            return false;
        }
        try {
            const { hasPurchased } = await fetchWithAuth(`${API_URL}/orders/purchase-status/${productId}`);
            return hasPurchased;
        } catch (error) {
            console.error("Failed to check purchase status", error);
            return false;
        }
    }
};
