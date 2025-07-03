// src/pages/ConfirmSignUp.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConfirmSignUp() {
  const [email, setEmail] = useState('');
  // Reverted back to a single string state for the code
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_API_GATEWAY_INVOKE_URL}/confirm-signup`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          confirmationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      alert('Account confirmed successfully! You can now sign in.');
      navigate('/signin');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Verify Your Account</h1>
      <p>Enter the 6-digit code we sent to your email.</p>
      <form onSubmit={handleSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div style={{ marginTop: '1rem' }}>
          {/* The label and input have been updated as requested */}
          <label htmlFor="confirmationCode">Enter special code:</label>
          <input
            id="confirmationCode"
            type="text"
            value={confirmationCode}
            onChange={(e) => setConfirmationCode(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <button type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
          {isLoading ? 'Verifying...' : 'Verify Account'}
        </button>
      </form>
    </div>
  );
}