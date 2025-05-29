import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  Event as EventIcon,
  MenuBook as MenuBookIcon,
  Map as MapIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Chat as ChatIcon,
  HelpOutline as HelpIcon,
  Settings as SettingsIcon,
  LibraryBooks as LibraryBooksIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const drawerWidth = 280;

const menuItems = [
  {
    text: 'Главная',
    icon: <DashboardIcon />, 
    path: '/'
  },
  {
    text: 'Задачи',
    icon: <AssignmentIcon />, 
    path: '/tasks'
  },
  {
    text: 'Расписание',
    icon: <CalendarIcon />, 
    path: '/schedule'
  },
  {
    text: 'Учебные материалы',
    icon: <MenuBookIcon />, 
    path: '/materials'
  },
  {
    text: 'Карта кампуса',
    icon: <MapIcon />, 
    path: '/campus-map'
  },
  {
    text: 'Вакансии',
    icon: <WorkIcon />, 
    path: '/vacancies'
  },
  {
    text: 'События',
    icon: <EventIcon />, 
    path: '/events'
  },
  {
    text: 'Чат',
    icon: <ChatIcon />, 
    path: '/chat'
  },
  {
    text: 'Часто задаваемые вопросы',
    icon: <HelpIcon />, 
    path: '/faq'
  },
  {
    text: 'Настройки',
    icon: <SettingsIcon />, 
    path: '/settings'
  },
  {
    text: 'Дополнительные курсы',
    icon: <LibraryBooksIcon />, 
    path: '/extra-courses'
  }
];

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: '#222E3C',
          borderRight: 'none',
          color: '#fff',
        }
      }}
    >
      <Box sx={{ mt: 7, pb: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <List sx={{ px: 0.5 }}>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                px: 2,
                py: 1.2,
                '&.Mui-selected': {
                  bgcolor: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  '& .MuiListItemIcon-root': {
                    color: '#fff',
                  },
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.04)',
                },
              }}
            >
              <ListItemIcon sx={{
                color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.7)',
                minWidth: 36,
                fontSize: 22
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  sx: {
                    fontSize: '1rem',
                    color: location.pathname === item.path ? '#fff' : 'rgba(255,255,255,0.87)'
                  }
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 