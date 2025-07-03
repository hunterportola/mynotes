// src/pages/SignIn.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/signin`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      if (data.IdToken) {
        login(data.IdToken);
        navigate('/dashboard');
      } else {
        throw new Error('Authentication failed, no token received.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-portola-cotton text-portola-dark-green min-h-screen flex flex-col justify-center items-center p-4 font-garamond">
      <div className="bg-portola-cream w-full max-w-xl p-12 rounded-lg shadow-xl text-center">
        <h1 className="text-5xl font-bold mb-8 text-portola-bronze">
          Sign In
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600">{error}</p>}
          <div className="text-left">
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-portola-gold focus:border-portola-gold font-garamond"
            />
          </div>
          <div className="text-left">
            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-portola-gold focus:border-portola-gold font-garamond"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-portola-green text-portola-cream font-garamond font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity text-xl"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-8 text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-portola-bronze hover:underline">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}
