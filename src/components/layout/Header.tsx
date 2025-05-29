import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  useTheme,
  Badge,
  Tooltip,
  ButtonBase,
  Popover,
  List,
  ListItem,
  Button
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  MarkEmailRead as MarkReadIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTheme as useAppTheme } from '../../context/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNotificationStore } from '../../store/notificationStore';

// Update interface to include the required props
export interface HeaderProps {
  onOpenSidebar: () => void;
  drawerWidth: number;
}

const Header: React.FC<HeaderProps> = ({ onOpenSidebar, drawerWidth }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { theme: currentTheme, toggleTheme } = useAppTheme();
  const { user, logout } = useAuthStore();
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotificationStore();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsOpen = Boolean(notificationsAnchorEl);
  
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };
  
  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id);
    if (link) {
      navigate(link);
    }
    handleNotificationsClose();
  };
  
  return (
    <AppBar 
      position="fixed" 
      color="default" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'var(--header-bg)',
        color: 'var(--header-text)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        transition: 'background-color 0.3s, color 0.3s, padding-top 0.3s',
        paddingTop: 'env(safe-area-inset-top, 24px)',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={onOpenSidebar}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography 
          variant="h6" 
          component={Link}
          to="/"
          sx={{ 
            color: 'inherit',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            mr: { xs: 2, sm: 3 }
          }}
        >
          StudentHub
        </Typography>
        {/* Все иконки строго справа */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, ml: 'auto' }}>
          <Tooltip title={currentTheme === 'light' ? 'Темная тема' : 'Светлая тема'}>
            <IconButton color="inherit" onClick={toggleTheme} size="large">
              {currentTheme === 'light' ? <DarkModeIcon fontSize="large" /> : <LightModeIcon fontSize="large" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Уведомления">
            <IconButton 
              color="inherit" 
              onClick={handleNotificationsMenu}
              aria-label="notifications"
              aria-controls="notifications-menu"
              aria-haspopup="true"
              size="large"
            >
              <Badge color="error" badgeContent={unreadCount}>
                <NotificationsIcon fontSize="large" />
              </Badge>
            </IconButton>
          </Tooltip>
          <Box>
            <Tooltip title="Аккаунт">
              <ButtonBase 
                onClick={handleMenu}
                sx={{ 
                  borderRadius: '50%',
                  overflow: 'hidden',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '2px solid var(--outline)'
                }}
              >
                {user?.photoURL ? (
                  <Avatar src={user.photoURL} alt={user.displayName || "User"} sx={{ width: 28, height: 28, bgcolor: 'var(--surface-variant)' }} />
                ) : (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: 'var(--surface-variant)', color: '#fff' }}>
                    {user?.displayName ? user.displayName[0].toUpperCase() : <AccountCircleIcon fontSize="medium" />}
                  </Avatar>
                )}
              </ButtonBase>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={isMenuOpen}
              onClose={handleClose}
              PaperProps={{
                elevation: 0,
                sx: {
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 180,
                  '& .MuiDivider-root': {
                    my: 1,
                  },
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" noWrap fontWeight="medium">
                  {user?.displayName || "Пользователь"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
              
              <Divider />
              
              <MenuItem onClick={() => handleNavigate('/profile')}>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                Мой профиль
              </MenuItem>
              
              <MenuItem onClick={() => handleNavigate('/settings')}>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Настройки
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Выйти
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
      
      {/* Notifications popover */}
      <Popover
        id="notifications-popover"
        open={isNotificationsOpen}
        anchorEl={notificationsAnchorEl}
        onClose={handleNotificationsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            mt: 1,
            minWidth: 360,
            maxWidth: 400,
            maxHeight: 500,
            // Removed duplicate overflow property
            borderRadius: 2,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.02)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Уведомления
            {unreadCount > 0 && (
              <Badge 
                badgeContent={unreadCount} 
                color="error" 
                sx={{ ml: 1 }} 
              />
            )}
          </Typography>
          <Box>
            <Tooltip title="Отметить все как прочитанные">
              <IconButton 
                size="small"
                onClick={() => markAllAsRead()}
                disabled={unreadCount === 0}
              >
                <MarkReadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="textSecondary">
              У вас нет уведомлений
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                onClick={() => handleNotificationClick(notification.id, notification.link)}
                button
                sx={{ 
                  opacity: notification.read ? 0.7 : 1,
                  bgcolor: notification.read ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
                  borderLeft: notification.read ? 'none' : `3px solid var(--notification-${notification.type}-color)`,
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.06)'
                  }
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box 
                        className={`notification-icon ${notification.type}`} 
                      />
                      <Typography variant="subtitle2" fontWeight={notification.read ? 'normal' : 'medium'}>
                        {notification.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" color="textSecondary">
                        {formatDistanceToNow(notification.date, { addSuffix: true, locale: ru })}
                      </Typography>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        sx={{ ml: 1, p: 0.5 }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mt: 0.5, pr: 2 }}>
                    {notification.message}
                  </Typography>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
        
        {notifications.length > 0 && (
          <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                // TODO: Navigate to all notifications page
                handleNotificationsClose();
              }}
            >
              Показать все уведомления
            </Button>
          </Box>
        )}
      </Popover>
    </AppBar>
  );
};

export default Header;
