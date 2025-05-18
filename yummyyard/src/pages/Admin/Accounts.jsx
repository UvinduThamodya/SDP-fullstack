import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Button, Tabs, Tab, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Snackbar, Alert, ThemeProvider, createTheme, CssBaseline
} from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import BadgeIcon from '@mui/icons-material/Badge';
import SidebarAdmin from '../../components/SidebarAdmin';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';

// Create custom theme with Poppins font
const theme = createTheme({
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    }
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  components: {
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f5f5',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const Accounts = () => {
  const [tab, setTab] = useState('staff');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, account: null });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        :  `http://localhost:5000/api/admin/staff/${account.id}`; // Allow direct deletion for staff
      
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

  const handleSendDeleteRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const { account } = deleteDialog;
      
      // Send delete request instead of deleting
      const response = await fetch(`http://localhost:5000/api/admin/delete-request/${account.id}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to send delete request');
      }
      
      setNotification({
        open: true,
        message: `Delete request sent to ${account.name}`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error sending delete request:', err);
      setNotification({
        open: true,
        message: 'Failed to send delete request',
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
    navigate('/staffregister');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', position: 'relative', background: theme.palette.background.default }}>
        {/* Sidebar for desktop, Drawer-style for mobile */}
        <Box
          sx={{
            display: { xs: sidebarOpen ? 'block' : 'none', sm: 'block' },
            position: { xs: 'fixed', sm: 'relative' },
            zIndex: 1200,
            height: '100vh',
            minHeight: '100vh',
            width: { xs: 240, sm: 'auto' },
            background: { xs: '#fff', sm: 'none' },
            boxShadow: { xs: 3, sm: 'none' },
            transition: 'left 0.3s',
            left: { xs: sidebarOpen ? 0 : '-100%', sm: 0 },
            top: 0,
          }}
        >
          <SidebarAdmin
            open={sidebarOpen}
            toggleSidebar={() => setSidebarOpen(false)}
            sx={{
              height: '100vh',
              minHeight: '100vh',
              borderRight: 0,
            }}
          />
        </Box>
        {/* Mobile menu button */}
        <Button
          variant="contained"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          sx={{
            display: { xs: 'flex', sm: 'none' },
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1300,
            minWidth: 'auto',
            width: 48,
            height: 48,
            borderRadius: '50%',
            boxShadow: 3,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MenuIcon />
        </Button>
        <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 3 }, width: '100%' }}>
          <Container
            maxWidth="lg"
            sx={{
              mt: 4,
              mb: 4,
              px: { xs: 0.5, sm: 0 },
              // Remove ugly horizontal scroll, use responsive table wrapper instead
              overflowX: 'unset',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 1.5, sm: 3 },
                mb: 4,
                backgroundColor: '#fff',
                borderRadius: 3,
                boxShadow: { xs: '0 2px 12px rgba(25,118,210,0.07)', sm: 'none' },
                minHeight: 200,
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  mb: 3,
                  color: '#3ACA82', // Changed from '#1976d2' to '#3ACA82'
                  textAlign: 'center',
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  fontFamily: 'Poppins, Arial, sans-serif',
                }}
              >
                Accounts Management
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'stretch', sm: 'center' },
                  mb: 3,
                  borderBottom: '1px solid #e0e0e0',
                  pb: 1,
                  gap: { xs: 2, sm: 0 },
                }}
              >
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  textColor="primary"
                  indicatorColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      fontWeight: 500,
                      fontSize: '1rem',
                      px: 3,
                      minHeight: 48,
                    },
                    '& .Mui-selected': {
                      color: '#3ACA82', // Changed tab text color when selected
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#3ACA82', // Changed indicator color
                    }
                  }}
                >
                  <Tab
                    icon={<BadgeIcon sx={{ mr: 1 }} />}
                    iconPosition="start"
                    label="Staff"
                    value="staff"
                  />
                  <Tab
                    icon={<PeopleAltIcon sx={{ mr: 1 }} />}
                    iconPosition="start"
                    label="Customers"
                    value="customers"
                  />
                </Tabs>
                {tab === 'staff' && (
                  <Button
                    variant="contained"
                    sx={{
                      py: 1,
                      px: 2,
                      borderRadius: 3,
                      fontWeight: 600,
                      boxShadow: '0 2px 8px rgba(58, 202, 130, 0.15)',
                      mt: { xs: 1, sm: 0 },
                      alignSelf: { xs: 'flex-end', sm: 'auto' },
                      bgcolor: '#3ACA82', // Changed color to #3ACA82
                      '&:hover': {
                        bgcolor: '#2d9e68', // Darker shade for hover
                      }
                    }}
                    startIcon={<AddIcon />}
                    onClick={handleAddStaff}
                  >
                    Add Staff
                  </Button>
                )}
              </Box>
              {/* Responsive Table Wrapper */}
              <Box
                sx={{
                  width: '100%',
                  overflowX: { xs: 'auto', sm: 'visible' },
                  borderRadius: 3,
                  boxShadow: { xs: '0 2px 12px rgba(25,118,210,0.07)', sm: 'none' },
                  background: { xs: '#f9fafb', sm: 'transparent' },
                  p: { xs: 1, sm: 0 },
                }}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                    <CircularProgress size={40} thickness={4} />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
                ) : (
                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: 2,
                      borderRadius: 2,
                      minWidth: 600,
                      background: '#fff',
                      overflowX: 'auto',
                    }}
                  >
                    <Table size="small">
                      <TableHead>
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
                              <Typography variant="body1" sx={{ py: 4, color: '#666' }}>
                                No accounts found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAccounts.map((account) => (
                            <TableRow
                              key={`${account.role}-${account.id}`}
                              hover
                              sx={{
                                '&:last-child td, &:last-child th': { border: 0 },
                                background: { xs: '#fff', sm: 'inherit' },
                              }}
                            >
                              <TableCell>{account.id}</TableCell>
                              <TableCell sx={{ fontWeight: 500 }}>{account.name}</TableCell>
                              <TableCell>{account.email}</TableCell>
                              <TableCell>{account.phone}</TableCell>
                              <TableCell>
                                <Box sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: account.role === 'Admin'
                                    ? theme.palette.primary.main
                                    : account.role === 'Staff'
                                      ? theme.palette.secondary.main
                                      : '#666'
                                }}>
                                  {account.role === 'Admin' ? (
                                    <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                                  ) : account.role === 'Staff' ? (
                                    <BadgeIcon sx={{ mr: 1 }} />
                                  ) : (
                                    <PersonIcon sx={{ mr: 1 }} />
                                  )}
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
                                  disabled={account.role === 'Admin'}
                                  size="small"
                                  sx={{
                                    borderRadius: 4,
                                    minWidth: '100px',
                                    fontWeight: 600,
                                    '&.Mui-disabled': {
                                      opacity: 0.5,
                                    }
                                  }}
                                >
                                  {account.role === 'Customer' ? 'Delete Request' : 'Delete'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
          </Container>
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog 
          open={deleteDialog.open} 
          onClose={handleCloseDialog}
          PaperProps={{ 
            sx: { borderRadius: 2, px: 1 } 
          }}
        >
          <DialogTitle sx={{ fontWeight: 600 }}>
            {deleteDialog.account?.role === 'Customer' ? 'Send Delete Request' : 'Confirm Deletion'}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {deleteDialog.account?.role === 'Customer'
                ? `Instead of immediately deleting ${deleteDialog.account?.name}'s account, a deletion request will be sent to the customer. They can accept or reject this request.`
                : `Are you sure you want to delete ${deleteDialog.account?.name}'s account? This action cannot be undone.`}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ pb: 2, px: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              sx={{ borderRadius: 6 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={deleteDialog.account?.role === 'Customer' ? handleSendDeleteRequest : handleDeleteConfirm} 
              color="primary" 
              variant="contained"
              sx={{ borderRadius: 6 }}
            >
              {deleteDialog.account?.role === 'Customer' ? 'Send Request' : 'Delete'}
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
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity} 
            sx={{ width: '100%', fontWeight: 500 }}
            variant="filled"
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default Accounts;