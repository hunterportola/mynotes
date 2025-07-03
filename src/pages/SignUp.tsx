// src/pages/SignUp.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/signup`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Sign up failed.');
      }
      
      // The redirect is now instant, with no delay.
      navigate('/confirm-signup', { state: { email: email } });

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
          Create Your Account
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

          <div className="text-left">
            <label htmlFor="confirmPassword" className="block text-lg font-medium text-gray-700 mb-2">Confirm Password</label>
            <input 
              id="confirmPassword" 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-portola-gold focus:border-portola-gold font-garamond"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-portola-green text-portola-cream font-garamond font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity text-xl"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-gray-600">
          Already have an account?{' '}
          <Link to="/" className="text-portola-bronze hover:underline">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}
