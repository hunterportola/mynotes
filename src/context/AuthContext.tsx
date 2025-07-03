// src/context/AuthContext.tsx
import { createContext, useState, useContext, useEffect } from 'react';
import type { ReactNode } from 'react';

// Define the shape of the context data
interface AuthContextType {
  token: string | null;
  login: (newToken: string) => void;
  logout: () => void;
}

// Create the context with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);

  // On initial load, check if a token exists in local storage
  useEffect(() => {
    const storedToken = localStorage.getItem('id_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Function to handle logging in
  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('id_token', newToken);
  };

  // Function to handle logging out
  const logout = () => {
    setToken(null);
    localStorage.removeItem('id_token');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Create a custom hook for easy context consumption
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}