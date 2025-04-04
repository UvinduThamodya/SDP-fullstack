import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Register from "./pages/Register"; // Import the Register component
import Login from "./pages/Login"; // Import the Login component
import Homepage from "./pages/HomePage"; // Import the Homepage component
import Menu from './pages/Menu'; // Corrected the import path for the Menu component
import "./App.css";
import PlaceOrder from "./pages/PlaceOrder"; // Import the PlaceOrder component
import AboutContact from './pages/AboutContact';  // Import AboutContact
import HomepageUser from './pages/HomePageUser'; // Import HomepageUser

function App() {
  return (
    <BrowserRouter>
      <AppNavigation /> {/* Move navigation logic into a separate component */}
      
      <Routes>
        <Route path="/menu" element={<Menu />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/placeorder" element={<PlaceOrder />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/aboutcontact" element={<AboutContact />} />
        <Route path="/HomepageUser" element={<HomepageUser />} />
      </Routes>
    </BrowserRouter>
  );
}

// Separate component for the navigation bar
function AppNavigation() {
  const navigate = useNavigate(); // Use navigate hook inside a component rendered by BrowserRouter
  
  // Handle logout
  const handleLogout = () => {
    // Clear the JWT token from localStorage or sessionStorage
    localStorage.removeItem('token');
    
    // Optionally clear user data or session details
    sessionStorage.removeItem('user'); // If you store any user details
    
    // Redirect to login page after logout
    navigate('/login');
  };

  return (
    <div className="App">
      <nav>
        {/* Add navigation logic to show "Logout" if the user is logged in */}
        {localStorage.getItem('token') ? (
          <button onClick={handleLogout}>Log Out</button>
        ) : (
          <div>
          </div>
        )}
      </nav>
    </div>
  );
}

export default App;
