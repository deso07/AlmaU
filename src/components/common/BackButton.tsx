import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconButton, Box, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface BackButtonProps {
  customPath?: string;
  showText?: boolean;
  variant?: 'fixed' | 'inline';
}

const BackButton: React.FC<BackButtonProps> = ({ 
  customPath, 
  showText = false,
  variant = 'fixed'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (customPath) {
      navigate(customPath);
    } else if (location.pathname === '/') {
      // Если мы на главной странице, ничего не делаем
      return;
    } else {
      navigate(-1);
    }
  };

  const buttonContent = (
    <>
      <IconButton 
        onClick={handleBack}
        size="large"
        sx={{
          color: 'var(--text)',
          padding: { xs: '8px', sm: '12px' },
          '&:hover': {
            backgroundColor: 'var(--hover-overlay)',
          }
        }}
      >
        <ArrowBackIcon />
      </IconButton>
      {showText && (
        <Typography 
          variant="body1" 
          sx={{ 
            ml: 1,
            color: 'var(--text)',
            display: { xs: 'none', sm: 'block' }
          }}
        >
          {location.pathname === '/' ? 'Главная' : 'Назад'}
        </Typography>
      )}
    </>
  );

  if (variant === 'fixed') {
    return (
      <Box sx={{ 
        position: 'fixed',
        top: { xs: '70px', sm: '80px' },
        left: { xs: '10px', sm: '20px' },
        zIndex: 1000,
        backgroundColor: 'var(--bg)',
        borderRadius: '50%',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
          backgroundColor: 'var(--hover-bg)',
        }
      }}>
        {buttonContent}
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex',
      alignItems: 'center',
      mb: 2,
      cursor: 'pointer',
      '&:hover': {
        opacity: 0.8
      }
    }} onClick={handleBack}>
      {buttonContent}
    </Box>
  );
};

export default BackButton; 