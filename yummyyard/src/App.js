import React, { useEffect } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Homepage from "./pages/HomePage";
import Menu from './pages/Menu';
import "./App.css";
import PlaceOrder from "./pages/PlaceOrder";
import AboutContact from './pages/AboutContact';
import HomepageUser from './pages/HomePageUser';
import { AuthProvider, useAuth } from './context/Authcontext'; // Import AuthContext

// Protected Route component that checks for authentication
function ProtectedRoute({ children }) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);
  
  if (!token) {
    return null; // Render nothing while redirecting
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/aboutcontact" element={<AboutContact />} />
        
        {/* Protected routes */}
        <Route 
          path="/menu" 
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/placeorder" 
          element={
            <ProtectedRoute>
              <PlaceOrder />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/HomepageUser" 
          element={
            <ProtectedRoute>
              <HomepageUser />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <AppNavigation />
    </AuthProvider>
  );
}

// Separate component for the navigation bar
function AppNavigation() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  
  // Handle logout
  const handleLogout = () => {
    // Clear the JWT token and user data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login page after logout
    navigate('/');
  };

  // return (
  //   <div className="App">
  //     <nav>
  //       {token ? (
  //         <div className="auth-nav">
  //           {user && <span>Welcome, {user.name}!</span>}
  //           <button onClick={handleLogout}>Log Out</button>
  //         </div>
  //       ) : (
  //         <div className="auth-nav">
  //           <Link to="/login">Login</Link>
  //           <Link to="/register">Register</Link>
  //         </div>
  //       )}
  //     </nav>
  //   </div>
  // );
}

export default App;
