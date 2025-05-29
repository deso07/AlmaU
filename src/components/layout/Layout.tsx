import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Container, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import SupportChat from '../SupportChat';
import BackButton from '../common/BackButton';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  
  // The width of the sidebar drawer
  const drawerWidth = 280;
  
  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };
  
  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  // Показываем кнопку "Назад" на всех страницах, кроме главной
  const showBackButton = location.pathname !== '/';
  
  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      flexDirection: 'column',
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
        maxWidth: '100%',
        px: { xs: 2, sm: 3, md: 4 }
      }}>
        <Container 
          maxWidth="xl" 
          sx={{ 
            py: { xs: 2, sm: 3, md: 4 },
            px: { xs: 1, sm: 2, md: 3 },
            '& > *': {
              maxWidth: '100%',
              overflowX: 'hidden'
            }
          }}
        >
          {showBackButton && (
            <BackButton 
              showText={!isMobile}
              variant="inline"
              customPath={location.pathname === '/' ? undefined : '/'}
            />
          )}
          <Outlet />
        </Container>
      </Box>
      <Footer />
      <SupportChat />
    </Box>
  );
};

export default Layout;
