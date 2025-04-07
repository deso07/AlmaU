import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get stored theme preference or default to 'light'
  const [theme, setTheme] = useState<ThemeType>(() => {
    const storedTheme = localStorage.getItem('theme');
    return (storedTheme as ThemeType) || 'light';
  });
  
  // Update body data-theme attribute when theme changes
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Create Material UI theme based on current theme
  const muiTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: theme as PaletteMode,
        ...(theme === 'light' 
          ? {
              // Light theme colors
              primary: {
                main: '#1976d2',
              },
              secondary: {
                main: '#6c757d',
              },
              background: {
                default: '#f5f7fa',
                paper: '#ffffff',
              },
              text: {
                primary: '#333333',
                secondary: '#666666',
              },
            }
          : {
              // Dark theme colors
              primary: {
                main: '#90caf9',
              },
              secondary: {
                main: '#a0aec0',
              },
              background: {
                default: '#121212',
                paper: '#1e1e1e',
              },
              text: {
                primary: '#e0e0e0',
                secondary: '#a0a0a0',
              },
            })
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none', // Removes the default background overlay pattern
              backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e',
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e',
              color: theme === 'light' ? '#333333' : '#e0e0e0',
              borderBottom: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'}`,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e',
              border: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
            },
          },
        },
        MuiDialog: {
          styleOverrides: {
            paper: {
              backgroundImage: 'none', 
              backgroundColor: theme === 'light' ? '#ffffff' : '#1e1e1e',
            },
          },
        },
        MuiTableCell: {
          styleOverrides: {
            root: {
              borderBottom: `1px solid ${theme === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'}`,
            },
          },
        },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
              },
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              '&.MuiChip-outlined': {
                borderColor: theme === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
              },
            },
          },
        }
      },
    });
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
