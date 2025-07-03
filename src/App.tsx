// src/App.tsx

import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './components/SignUp';
import ConfirmSignUp from './pages/ConfirmSignUp'; 
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* 2. This route MUST exist for the page to render. */}
        <Route path="/confirm-signup" element={<ConfirmSignUp />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      </Routes>
      
    </div>
  );
}

export default App;