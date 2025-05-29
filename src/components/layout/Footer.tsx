import React from 'react';
import { Box, IconButton, Typography, Link } from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import TelegramIcon from '@mui/icons-material/Telegram';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 2,
        px: 2,
        mt: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        borderTop: '1px solid #eee',
        gap: 2
      }}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
        © {new Date().getFullYear()} StudentHub
      </Typography>
      <Link href="https://www.instagram.com/studenthub_kz" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>
        <IconButton color="inherit" size="large">
          <InstagramIcon fontSize="medium" />
        </IconButton>
      </Link>
      <Link href="https://t.me/studetnhubkz" target="_blank" rel="noopener" sx={{ color: 'inherit' }}>
        <IconButton color="inherit" size="large">
          <TelegramIcon fontSize="medium" />
        </IconButton>
      </Link>
    </Box>
  );
};

export default Footer; 