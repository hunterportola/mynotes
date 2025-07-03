// src/pages/Home.tsx
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="bg-portola-cotton text-portola-dark-green min-h-screen flex flex-col justify-center items-center p-4 font-sans">
      
      <div className="bg-portola-cream w-full max-w-xl p-12 rounded-lg shadow-xl text-center">
        
        <h1 className="font-garamond text-6xl font-bold mb-10 text-portola-bronze">
          MyNotes
        </h1>
        
        <div className="flex flex-row gap-x-6">
          
          <Link 
            to="/signin" 
            className="flex-1 bg-portola-green text-portola-cream font-garamond font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity text-xl text-center"
          >
            Sign In
          </Link>
          
          <Link 
            to="/signup" 
            className="flex-1 bg-portola-green text-portola-cream font-garamond font-bold py-3 px-8 rounded-md hover:opacity-90 transition-opacity text-xl text-center"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
}
