import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from './AuthContext';

// Styled components to match the theme
const LoginPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  boxShadow: '0 8px 24px rgba(43, 123, 140, 0.12)',
  borderRadius: '16px',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  margin: theme.spacing(1),
  backgroundColor: theme.palette.primary.main,
  width: 56,
  height: 56,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  padding: theme.spacing(1.5),
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '1rem',
  fontWeight: 600,
  backgroundColor: theme.palette.primary.main,
  boxShadow: '0 4px 10px rgba(43, 123, 140, 0.2)',
  '&:hover': {
    backgroundColor: '#236C7D',
    boxShadow: '0 6px 14px rgba(43, 123, 140, 0.3)',
    transform: 'translateY(-2px)',
  },
}));

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Check if credentials match (admin/admin)
    if (username === 'admin' && password === 'admin') {
      // Login using auth context
      login(username);
      
      // Show success message
      setOpenSnackbar(true);
      
      // Navigate to home page after successful login
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } else {
      setError('Invalid username or password');
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 8 }}>
      <LoginPaper>
        <StyledAvatar>
          <LockOutlinedIcon fontSize="large" />
        </StyledAvatar>
        
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 700, color: '#2B7B8C' }}>
          Sign In
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2, borderRadius: '8px' }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '&:hover fieldset': {
                  borderColor: '#2B7B8C',
                },
              },
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                '&:hover fieldset': {
                  borderColor: '#2B7B8C',
                },
              },
            }}
          />
          
          <StyledButton
            type="submit"
            fullWidth
            variant="contained"
          >
            Sign In
          </StyledButton>
          
          <Typography variant="body2" align="center" sx={{ mt: 4, color: 'text.secondary' }}>
            Use username: <b>admin</b>, password: <b>admin</b>
          </Typography>
        </Box>
      </LoginPaper>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={1500}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success"
          sx={{ 
            width: '100%', 
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(43, 123, 140, 0.2)',
          }}
        >
          Login successful! Redirecting to home page...
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;