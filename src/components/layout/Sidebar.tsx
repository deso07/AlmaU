import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TasksIcon,
  Event as ScheduleIcon,
  MenuBook as MaterialsIcon,
  LocationOn as CampusIcon,
  Work as JobIcon,
  EventNote as EventsIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Close as CloseIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Grade as GradeIcon,
  Person as PersonIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

// Updated interface with required props
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  drawerWidth: number;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, drawerWidth }) => {
  const location = useLocation();
  const theme = useTheme();
  const { user } = useAuthStore();
  
  const sidebarItems = [
    {
      title: 'Главная',
      path: '/',
      icon: <DashboardIcon />
    },
    {
      title: 'Задачи',
      path: '/tasks',
      icon: <TasksIcon />
    },
    {
      title: 'Расписание',
      path: '/schedule',
      icon: <ScheduleIcon />
    },
    {
      title: 'Учебные материалы',
      path: '/materials',
      icon: <MaterialsIcon />
    },
    {
      title: 'Карта кампуса',
      path: '/campus-map',
      icon: <CampusIcon />
    },
    {
      title: 'Вакансии',
      path: '/jobs',
      icon: <JobIcon />
    },
    {
      title: 'События',
      path: '/events',
      icon: <EventsIcon />
    },
    {
      title: 'Чат',
      path: '/chat',
      icon: <ChatIcon />
    },
    {
      title: 'Часто задаваемые вопросы',
      path: '/faq',
      icon: <QuestionAnswerIcon />
    },
    {
      title: 'Журнал оценок',
      path: '/grades',
      icon: <GradeIcon />,
      role: ['admin', 'teacher']
    },
    {
      title: 'Профиль преподавателя',
      path: '/teacher-profile',
      icon: <PersonIcon />,
      role: ['admin', 'teacher']
    },
    {
      title: 'Настройки',
      path: '/settings',
      icon: <SettingsIcon />
    },
    {
      title: 'Дополнительные курсы',
      path: '/additional-courses',
      icon: <MenuBookIcon />
    }
  ];
  
  // Filter menu items based on user role
  const filteredItems = sidebarItems.filter(item => {
    // If there's no role specified, show for everyone
    if (!item.role) return true;
    
    // Otherwise, check if user has the required role
    return user?.role && item.role.includes(user.role);
  });
  
  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={isOpen}
      onClose={onClose}
      ModalProps={{
        keepMounted: true // Better performance on mobile
      }}
      sx={{
        display: 'block',
        '& .MuiDrawer-paper': {
          width: { xs: '90vw', sm: drawerWidth },
          maxWidth: 400,
          boxSizing: 'border-box',
          bgcolor: 'var(--sidebar-bg, #1a2035)',
          color: 'var(--sidebar-text, #ffffff)',
          borderRight: 'none',
          borderTopRightRadius: { xs: 16, sm: 0 },
          borderBottomRightRadius: { xs: 16, sm: 0 },
          boxShadow: { xs: '0 8px 32px rgba(0,0,0,0.25)', sm: 'none' },
          transition: 'all 0.3s',
        },
      }}
    >
      <Box sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'var(--sidebar-bg, #1a2035)',
        color: 'var(--sidebar-text, #ffffff)'
      }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          p: theme.spacing(2),
        }}>
          <Typography 
            variant="h6"
            component="div"
            sx={{ 
              fontWeight: 'bold',
              color: 'var(--sidebar-text, #ffffff)',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            StudentHub
          </Typography>
          
          <IconButton 
            onClick={onClose} 
            sx={{ color: 'var(--sidebar-text, #ffffff)' }}
            aria-label="close sidebar"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.12)' }} />
        
        {/* Navigation items */}
        <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <List component="nav">
            {filteredItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              
              return (
                <ListItem 
                  key={item.path}
                  component={NavLink} 
                  to={item.path}
                  disablePadding
                  sx={{
                    borderRadius: '12px',
                    m: theme.spacing(1, 1.5),
                    color: isActive ? 'var(--sidebar-active-text, #ffffff)' : 'var(--sidebar-text, rgba(255, 255, 255, 0.7))',
                    minHeight: 48,
                    px: 2,
                    py: 1.5,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '1.1rem',
                    transition: 'background 0.2s',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.08)',
                    },
                    background: isActive ? 'rgba(255,255,255,0.12)' : 'none',
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.title} />
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
