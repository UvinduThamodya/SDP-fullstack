import React, { useState, useEffect } from 'react';
import {
  Box, Container, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, Snackbar, Alert, Grid, Card, CardContent,
} from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import SidebarAdmin from '../../components/SidebarAdmin';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Create a custom theme
const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, Arial, sans-serif',
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.15rem',
    },
    body1: {
      fontSize: '0.95rem',
    },
  },
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f7fa',
      paper: '#ffffff',
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
  },
});

const StyledContainer = styled(Container)(({ theme }) => ({
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const ResponsiveGrid = styled(Grid)(({ theme }) => ({
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    gap: theme.spacing(2),
  },
}));

const ResponsiveTableContainer = styled(TableContainer)(({ theme }) => ({
  '& .MuiTableCell-root': {
    [theme.breakpoints.down('sm')]: {
      fontSize: '0.75rem',
      padding: theme.spacing(0.5),
    },
  },
  '& .MuiTableRow-root': {
    [theme.breakpoints.down('sm')]: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      borderBottom: `1px solid ${theme.palette.divider}`,
      marginBottom: theme.spacing(1),
    },
  },
}));

export default function Inventory() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default to hidden for mobile view

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    // Fetch inventory items (mocked for now)
    setInventoryItems([
      { id: 1, name: 'Item 1', quantity: 10, price: 100 },
      { id: 2, name: 'Item 2', quantity: 5, price: 50 },
    ]);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: 'flex', backgroundColor: theme.palette.background.default, minHeight: '100vh' }}>
        <SidebarAdmin open={sidebarOpen} toggleSidebar={toggleSidebar} />

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          <Button
            variant="contained"
            onClick={toggleSidebar}
            sx={{
              display: { xs: 'block', sm: 'none' }, // Ensure button is visible only on mobile view
              mb: 2,
              backgroundColor: theme.palette.primary.main,
              color: '#fff',
            }}
          >
            {sidebarOpen ? 'Hide Menu' : 'Show Menu'}
          </Button>

          <StyledContainer maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                Inventory
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setNotification({ open: true, message: 'Add Item clicked!', severity: 'info' })}
                sx={{ fontSize: { xs: '0.8rem', sm: '1rem' } }}
              >
                Add Item
              </Button>
            </Box>

            <Paper sx={{ p: { xs: 2, sm: 3 } }}>
              <ResponsiveTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Price</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                          <Typography color="textSecondary">No items available</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventoryItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.price}</TableCell>
                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon />}
                              onClick={() => setNotification({ open: true, message: `Edit Item ${item.id} clicked!`, severity: 'info' })}
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.9rem' }, mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DeleteIcon />}
                              onClick={() => setNotification({ open: true, message: `Delete Item ${item.id} clicked!`, severity: 'warning' })}
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.9rem' } }}
                              color="error"
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </ResponsiveTableContainer>
            </Paper>
          </StyledContainer>

          {/* Notification Snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={4000}
            onClose={() => setNotification({ ...notification, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              severity={notification.severity}
              sx={{
                width: '100%',
                fontFamily: 'Poppins, sans-serif',
                borderRadius: 2,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                fontSize: { xs: '0.8rem', sm: '1rem' },
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
