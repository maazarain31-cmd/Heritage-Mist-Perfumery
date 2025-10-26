import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, onClose, isOpen }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset state when modal opens or mode changes
    if (isOpen) {
        setError('');
        setPassword('');
        // Keep email for user convenience
    }
  }, [isOpen, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
        let response;
        if (mode === 'login') {
            response = await api.login(email, password);
        } else {
            response = await api.register(email, password);
        }
        onLoginSuccess(response.user);
    } catch (err: any) {
        setError(err.message || 'An error occurred.');
    } finally {
        setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(prevMode => (prevMode === 'login' ? 'register' : 'login'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
        <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-6">{mode === 'login' ? 'Sign In' : 'Create an Account'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
                    required
                />
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button 
                    type="submit"
                    disabled={isLoading}
                    className="mt-4 w-full py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400"
                >
                    {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Register')}
                </button>
            </form>
             <p className="text-center text-sm text-gray-600 mt-6">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
              <button onClick={toggleMode} className="font-medium text-gray-800 hover:underline focus:outline-none">
                {mode === 'login' ? 'Register' : 'Sign In'}
              </button>
            </p>
        </div>
      </div>
    </div>
  );
};
