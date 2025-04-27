import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Tabs, Tab, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import SidebarAdmin from '../../components/SidebarAdmin';
import { useNavigate } from 'react-router-dom';

const Accounts = () => {
  const [tab, setTab] = useState('staff');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, account: null });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        // Fetch customers
        const customersRes = await fetch('http://localhost:5000/api/admin/customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch staff (employees)
        const staffRes = await fetch('http://localhost:5000/api/admin/staff', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!customersRes.ok || !staffRes.ok) {
          throw new Error('Failed to fetch accounts');
        }
        
        const customers = await customersRes.json();
        const staff = await staffRes.json();
        
        // Format customers data
        const formattedCustomers = customers.map(customer => ({
          id: customer.customer_id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          role: 'Customer',
          address: customer.address
        }));
        
        // Format staff data
        const formattedStaff = staff.map(employee => ({
          id: employee.employee_id,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          role: employee.role // 'Admin' or 'Staff'
        }));
        
        // Combine all accounts
        setAccounts([...formattedStaff, ...formattedCustomers]);
      } catch (err) {
        console.error('Error fetching accounts:', err);
        setError('Failed to load accounts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccounts();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleDeleteClick = (account) => {
    setDeleteDialog({ open: true, account });
  };

  const handleDeleteConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      const { account } = deleteDialog;
      const endpoint = account.role === 'Customer' 
        ? `http://localhost:5000/api/customers/${account.id}`
        : `http://localhost:5000/api/staff/${account.id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      
      // Remove the deleted account from the state
      setAccounts(accounts.filter(acc => !(acc.id === account.id && acc.role === account.role)));
      setNotification({
        open: true,
        message: `${account.role} account deleted successfully`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error deleting account:', err);
      setNotification({
        open: true,
        message: 'Failed to delete account',
        severity: 'error'
      });
    } finally {
      setDeleteDialog({ open: false, account: null });
    }
  };

  const handleCloseDialog = () => {
    setDeleteDialog({ open: false, account: null });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Filter accounts based on selected tab
  const filteredAccounts = accounts.filter(account => {
    if (tab === 'staff') return account.role === 'Staff' || account.role === 'Admin';
    if (tab === 'customers') return account.role === 'Customer';
    return true;
  });

  const handleAddStaff = () => {
    navigate('/staffregister'); // Navigate to the staff registration page
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa', fontFamily: 'Poppins, sans-serif' }}>
      <SidebarAdmin />

      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" align="center" sx={{ mb: 3, fontWeight: 'bold' }}>
            Accounts Management
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Tabs value={tab} onChange={handleTabChange} centered>
              <Tab label="Staff" value="staff" />
              <Tab label="Customers" value="customers" />
            </Tabs>
            {tab === 'staff' && (
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />} 
                onClick={handleAddStaff}
              >
                Add Staff
              </Button>
            )}
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
          ) : (
            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Role</TableCell>
                    {tab === 'customers' && <TableCell>Address</TableCell>}
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAccounts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={tab === 'customers' ? 7 : 6} align="center">
                        <Typography variant="body1" sx={{ py: 2 }}>
                          No accounts found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAccounts.map((account) => (
                      <TableRow key={`${account.role}-${account.id}`}>
                        <TableCell>{account.id}</TableCell>
                        <TableCell>{account.name}</TableCell>
                        <TableCell>{account.email}</TableCell>
                        <TableCell>{account.phone}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1, color: account.role === 'Admin' ? 'primary.main' : 'text.secondary' }} />
                            {account.role}
                          </Box>
                        </TableCell>
                        {tab === 'customers' && <TableCell>{account.address || 'N/A'}</TableCell>}
                        <TableCell align="center">
                          <Button 
                            variant="outlined" 
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteClick(account)}
                            disabled={account.role === 'Admin'} // Prevent deleting admin accounts
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Container>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the {deleteDialog.account?.role} account for {deleteDialog.account?.name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Accounts;
