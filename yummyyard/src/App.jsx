import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Sidebar from './components/Sidebar';
import Menu from './components/Menu';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3dcd83',
    },
    secondary: {
      main: '#2196F3',
    },
    background: {
      default: '#FCFCFC',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
          },
        },
        outlined: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <Router>
      <Sidebar>
        <Switch>
          <Route path="/menu" component={Menu} />
          {/* ...existing routes... */}
        </Switch>
      </Sidebar>
    </Router>
  </ThemeProvider>
);

export default App;