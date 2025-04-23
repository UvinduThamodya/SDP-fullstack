import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Register from "./pages/Customer/Register";
import Login from "./pages/Customer/Login";
import Homepage from "./pages/Customer/HomePage";
import Menu from './pages/Customer/Menu';
import "./App.css";
import AboutContact from './pages/Customer/AboutContact';
import HomepageUser from './pages/Customer/HomePageUser';
import { AuthProvider } from './context/Authcontext'; 
import CustomerProfile from '../src/pages/Customer/CustomerProfile';
import SelectRole from './pages/SelectRole';
import Dashboard from './pages/Staff/Dashboard';
import StaffLogin from './pages/Staff/StaffLogin'; 
import StaffRegister from './pages/Staff/StaffRegister'; 
import Imventory from './pages/Staff/Inventory'; // Import Inventory component
import StaffProfile from './pages/Staff/StaffProfile'; // Import StaffProfile component
import Order from './pages/Staff/Order'; // Import Order component
import PlaceOrder from './pages/Customer/PlaceOrder';
import Accounts from './pages/Admin/Accounts';
import AdminRegister from './pages/Admin/AdminRegister';

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
        <Route path="/stafflogin" element={<StaffLogin />} />
        <Route path="/staffregister" element={<StaffRegister />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Homepage />} />
        <Route path="/aboutcontact" element={<AboutContact />} />
        <Route path="/selectrole" element={<SelectRole />} />
        <Route path="/inventory" element={<Imventory />} />
        <Route path="/staffprofile" element={<StaffProfile />} />
        <Route path="/order" element={<Order />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/adminregister" element={<AdminRegister />} />

        {/* Protected customer routes */}
        <Route 
          path="/menu" 
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <CustomerProfile />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/homepageuser" 
          element={
            <ProtectedRoute>
              <HomepageUser />
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

        {/* Staff routes */}
        {/* <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        /> */}
      </Routes>
    </AuthProvider>
  );
}

export default App;
