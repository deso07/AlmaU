import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // The width of the sidebar drawer
  const drawerWidth = 280;
  
  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg)',
      color: 'var(--text)',
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      {/* Header */}
      <Header 
        onOpenSidebar={handleOpenSidebar}
        drawerWidth={drawerWidth}
      />
      <Sidebar
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        drawerWidth={drawerWidth}
      />
      
      {/* Main content */}
      <Box component="main" sx={{ 
        flexGrow: 1, 
        pt: { xs: '64px', sm: '70px' },
        pb: 4,
        maxWidth: '100%'
      }}>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
