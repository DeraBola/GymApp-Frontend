'use client';

import { createTheme } from '@mui/material/styles';

const gymTheme = createTheme({
  palette: {
    primary: {
      main: '#ec4899',      // pink-500
      dark: '#db2777',      // pink-600
      light: '#f9a8d4',     // pink-300
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#a855f7',      // purple-500
      dark: '#9333ea',      // purple-600
      light: '#d8b4fe',     // purple-300
      contrastText: '#ffffff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            '&:hover': {
              background: 'linear-gradient(135deg, #db2777, #9333ea)',
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#f8fafc',
            color: '#64748b',
            fontWeight: 700,
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid #e2e8f0',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
          color: '#475569',
          fontSize: '0.875rem',
          padding: '14px 20px',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#fafafa',
          },
          '&:last-child td': {
            borderBottom: 0,
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#ec4899',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#ec4899',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#ec4899',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.7rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default gymTheme;
