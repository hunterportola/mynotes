// src/pages/ConfirmSignUp.tsx
import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
// 'Link' has been removed from this import statement
import { useLocation, useNavigate } from 'react-router-dom';

export default function ConfirmSignUp() {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the email passed from the SignUp page
  const email = location.state?.email;

  // If no email was passed in the route state, redirect back to signup.
  useEffect(() => {
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/confirm-signup`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, confirmationCode }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }
      alert('Account confirmed successfully! Please sign in.');
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-portola-cotton text-portola-dark-green min-h-screen flex flex-col justify-center items-center p-4 font-garamond">
      <div className="bg-portola-cream w-full max-w-xl p-12 rounded-lg shadow-xl text-center">
        <h1 className="text-5xl font-bold mb-4 text-portola-bronze">
          Verify Your Account
        </h1>
        
        {/* The new instructional message */}
        <p className="text-lg text-gray-600 mb-8">
          A confirmation code has been sent to <span className="font-bold">{email}</span>. Please enter it below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-600">{error}</p>}
          
          <div className="text-left">
            <label htmlFor="confirmationCode" className="block text-lg font-medium text-gray-700 mb-2">Verification Code</label>
            <input 
              id="confirmationCode" 
              type="text" 
              value={confirmationCode} 
              onChange={(e) => setConfirmationCode(e.target.value)} 
              required 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-portola-gold focus:border-portola-gold font-garamond"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-portola-green text-portola-cream font-garamond font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity text-xl"
          >
            {isLoading ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>
      </div>
    </div>
  );
}