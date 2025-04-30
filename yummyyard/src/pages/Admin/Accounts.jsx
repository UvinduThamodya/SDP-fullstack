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
    navigate('/staffregister');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <SidebarAdmin />

        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 4, backgroundColor: '#fff', borderRadius: 2 }}>
              <Typography variant="h4" sx={{ mb: 3, color: '#333', textAlign: 'center' }}>
                Accounts Management
              </Typography>
            
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                borderBottom: '1px solid #e0e0e0',
                pb: 1
              }}>
                <Tabs 
                  value={tab} 
                  onChange={handleTabChange} 
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{ 
                    '& .MuiTab-root': { 
                      fontWeight: 500,
                      fontSize: '1rem',
                      px: 3
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
                    color="primary" 
                    startIcon={<AddIcon />} 
                    onClick={handleAddStaff}
                    sx={{ py: 1, px: 2 }}
                  >
                    Add Staff
                  </Button>
                )}
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 4 }}>
                  <CircularProgress size={40} thickness={4} />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
              ) : (
                <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2, overflow: 'hidden' }}>
                  <Table>
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
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell>{account.id}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{account.name}</TableCell>
                            <TableCell>{account.email}</TableCell>
                            <TableCell>{account.phone}</TableCell>
                            <TableCell>
                              <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center',
                                color: account.role === 'Admin' ? theme.palette.primary.main : 
                                       account.role === 'Staff' ? theme.palette.secondary.main : '#666'
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
                                  '&.Mui-disabled': {
                                    opacity: 0.5,
                                  }
                                }}
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
            Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete the {deleteDialog.account?.role} account for{' '}
              <strong>{deleteDialog.account?.name}</strong>? This action cannot be undone.
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
              onClick={handleDeleteConfirm} 
              color="error" 
              variant="contained"
              sx={{ borderRadius: 6 }}
            >
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