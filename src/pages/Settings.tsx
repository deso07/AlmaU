import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Grid,
  Switch,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon,
  UploadFile as UploadFileIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';
import { uploadAvatar } from '../utils/storage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const { user, updateUserProfile } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  // Форма профиля - use existing user data or empty strings
  const [profileForm, setProfileForm] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    university: user?.university || '',
    faculty: user?.faculty || '',
    year: user?.year || '',
    phone: user?.phone || '',
    about: user?.about || ''
  });
  
  // Update form if user data changes
  useEffect(() => {
    if (user) {
      setProfileForm({
        displayName: user.displayName || '',
        email: user.email || '',
        university: user.university || '',
        faculty: user.faculty || '',
        year: user.year || '',
        phone: user.phone || '',
        about: user.about || ''
      });
    }
  }, [user]);
  
  // Форма пароля
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Настройки уведомлений
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    tasks: true,
    events: true,
    news: false,
    chat: true
  });
  
  // Другие настройки
  const [otherSettings, setOtherSettings] = useState({
    language: 'ru',
    autoSave: true,
    privateProfile: false
  });
  
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Обработчики форм
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value
    });
  };
  
  const handleProfileSave = () => {
    // Save all profile data
    updateUserProfile({
      displayName: profileForm.displayName,
      university: profileForm.university,
      faculty: profileForm.faculty,
      year: profileForm.year,
      phone: profileForm.phone,
      about: profileForm.about
    });
    
    setEditMode(false);
    showSnackbar('Профиль успешно обновлен');
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value
    });
  };
  
  const handlePasswordSave = () => {
    // Проверка паролей
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showSnackbar('Пароли не совпадают', 'error');
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      showSnackbar('Пароль должен быть не менее 6 символов', 'error');
      return;
    }
    
    // В реальном приложении здесь был бы запрос к API
    setPasswordDialogOpen(false);
    showSnackbar('Пароль успешно изменен');
    
    // Очистка полей
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };
  
  const handleToggleNotification = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationSettings({
      ...notificationSettings,
      [name]: event.target.checked
    });
  };
  
  const handleToggleOtherSetting = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtherSettings({
      ...otherSettings,
      [name]: event.target.checked
    });
  };
  
  const handleLanguageChange = (event: any) => {
    setOtherSettings({
      ...otherSettings,
      language: event.target.value
    });
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleTogglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };
  
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      
      // Проверяем размер файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Размер файла не должен превышать 5MB', 'error');
        return;
      }
      
      // Проверяем тип файла
      if (!file.type.startsWith('image/')) {
        showSnackbar('Пожалуйста, выберите изображение', 'error');
        return;
      }
      
      setAvatarFile(file);
      
      // Создаем preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAvatarChange = async () => {
    if (!avatarFile || !user) return;
    
    try {
      setIsUploading(true);
      
      // Загружаем файл в Storage
      const downloadURL = await uploadAvatar(avatarFile, user.uid);
      
      // Обновляем профиль пользователя
      await updateUserProfile({
        photoURL: downloadURL
      });
      
      setAvatarDialogOpen(false);
      showSnackbar('Аватар успешно обновлен');
      
      // Очищаем состояние
      setAvatarFile(null);
      setAvatarPreview('');
    } catch (error) {
      console.error('Error updating avatar:', error);
      showSnackbar('Ошибка при обновлении аватара', 'error');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Настройки
      </Typography>
      
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 2, 
          bgcolor: 'var(--surface)',
          border: '1px solid rgba(0, 0, 0, 0.12)',
          overflow: 'hidden'
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="settings tabs"
          sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(0, 0, 0, 0.02)' }}
        >
          <Tab 
            label="Профиль" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Безопасность" 
            icon={<LockIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Уведомления" 
            icon={<NotificationsIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Оформление" 
            icon={<PaletteIcon />} 
            iconPosition="start"
          />
        </Tabs>
        
        {/* Профиль */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Личная информация
              </Typography>
              {!editMode ? (
                <Button 
                  variant="outlined" 
                  startIcon={<EditIcon />} 
                  onClick={() => setEditMode(true)}
                >
                  Редактировать
                </Button>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="outlined" 
                    color="inherit"
                    onClick={() => setEditMode(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    variant="contained"
                    onClick={handleProfileSave}
                  >
                    Сохранить
                  </Button>
                </Box>
              )}
            </Box>
            
            <Grid container spacing={4}>
              <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar
                  src={avatarPreview || user?.photoURL || ""}
                  alt={user?.displayName || "User"}
                  sx={{ width: 150, height: 150, mb: 2 }}
                />
                
                <Button 
                  variant="outlined" 
                  startIcon={<UploadFileIcon />}
                  onClick={() => setAvatarDialogOpen(true)}
                >
                  Изменить фото
                </Button>
                
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Рекомендуемый размер: 300x300 пикселей, формат JPG или PNG
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={8}>
                {editMode ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="displayName"
                        label="Имя и фамилия"
                        fullWidth
                        variant="outlined"
                        value={profileForm.displayName}
                        onChange={handleProfileChange}
                        placeholder="Введите имя и фамилию"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="email"
                        label="Email"
                        fullWidth
                        variant="outlined"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="university"
                        label="Университет"
                        fullWidth
                        variant="outlined"
                        value={profileForm.university}
                        onChange={handleProfileChange}
                        placeholder="Введите название университета"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="faculty"
                        label="Факультет"
                        fullWidth
                        variant="outlined"
                        value={profileForm.faculty}
                        onChange={handleProfileChange}
                        placeholder="Введите название факультета"
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined">
                        <InputLabel id="year-label">Курс</InputLabel>
                        <Select
                          labelId="year-label"
                          name="year"
                          value={profileForm.year}
                          onChange={(e) => setProfileForm({...profileForm, year: e.target.value as string})}
                          label="Курс"
                          displayEmpty
                        >
                          <MenuItem value="">Выберите курс</MenuItem>
                          <MenuItem value="1">1 курс</MenuItem>
                          <MenuItem value="2">2 курс</MenuItem>
                          <MenuItem value="3">3 курс</MenuItem>
                          <MenuItem value="4">4 курс</MenuItem>
                          <MenuItem value="5">5 курс</MenuItem>
                          <MenuItem value="6">6 курс</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        name="phone"
                        label="Телефон"
                        fullWidth
                        variant="outlined"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        placeholder="Введите номер телефона"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="about"
                        label="О себе"
                        fullWidth
                        variant="outlined"
                        multiline
                        rows={4}
                        value={profileForm.about}
                        onChange={handleProfileChange}
                        placeholder="Расскажите о себе"
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <List disablePadding>
                    <ListItem disableGutters>
                      <ListItemIcon>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Имя и фамилия" 
                        secondary={profileForm.displayName || "Не указано"} 
                      />
                    </ListItem>
                    
                    <ListItem disableGutters>
                      <ListItemIcon>
                        <EmailIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={profileForm.email} 
                      />
                    </ListItem>
                    
                    <ListItem disableGutters>
                      <ListItemIcon>
                        <SchoolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Университет" 
                        secondary={profileForm.university || "Не указано"} 
                      />
                    </ListItem>
                    
                    <ListItem disableGutters>
                      <ListItemIcon>
                        <SchoolIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Факультет" 
                        secondary={profileForm.faculty ? 
                          `${profileForm.faculty}${profileForm.year ? `, ${profileForm.year} курс` : ''}` : 
                          "Не указано"} 
                      />
                    </ListItem>
                    
                    <ListItem disableGutters>
                      <ListItemIcon>
                        <PhoneIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Телефон" 
                        secondary={profileForm.phone || "Не указано"} 
                      />
                    </ListItem>
                    
                    <ListItem disableGutters sx={{ alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ mt: 1 }}>
                        <PersonIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary="О себе" 
                        secondary={profileForm.about || "Информация не добавлена"} 
                        secondaryTypographyProps={{ 
                          style: { whiteSpace: 'pre-wrap' }
                        }}
                      />
                    </ListItem>
                  </List>
                )}
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Безопасность */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Безопасность аккаунта
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Рекомендуем регулярно обновлять пароль для обеспечения безопасности вашей учетной записи.
            </Alert>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Пароль
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Для безопасности рекомендуем регулярно менять пароль
                  </Typography>
                </Box>
                
                <Button 
                  variant="outlined"
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Изменить пароль
                </Button>
              </Box>
            </Paper>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                mb: 3
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Двухфакторная аутентификация
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Добавьте дополнительный уровень защиты для вашего аккаунта
                  </Typography>
                </Box>
                
                <Button 
                  variant="outlined"
                  color="primary"
                >
                  Настроить
                </Button>
              </Box>
            </Paper>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                История входов
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Последние устройства, с которых был выполнен вход в ваш аккаунт
              </Typography>
              {user ? (
                <List>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemText 
                      primary={navigator.userAgent}
                      secondary={Intl.DateTimeFormat('ru-RU', { dateStyle: 'full', timeStyle: 'short' }).format(new Date())}
                    />
                    <Typography variant="body2" color="success.main">Текущий сеанс</Typography>
                  </ListItem>
                </List>
              ) : (
                <Typography variant="body2" color="textSecondary">История входов пуста</Typography>
              )}
            </Paper>
          </Box>
        </TabPanel>
        
        {/* Уведомления */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Настройки уведомлений
            </Typography>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                mb: 3
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Способы уведомлений
              </Typography>
              
              <List>
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Email уведомления" 
                    secondary="Получать уведомления на почту" 
                  />
                  <Switch 
                    checked={notificationSettings.email}
                    onChange={handleToggleNotification('email')}
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Push-уведомления" 
                    secondary="Получать уведомления в браузере" 
                  />
                  <Switch 
                    checked={notificationSettings.push}
                    onChange={handleToggleNotification('push')}
                  />
                </ListItem>
              </List>
            </Paper>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Типы уведомлений
              </Typography>
              
              <List>
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Задачи и дедлайны" 
                    secondary="Напоминания о предстоящих дедлайнах" 
                  />
                  <Switch 
                    checked={notificationSettings.tasks}
                    onChange={handleToggleNotification('tasks')}
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemText 
                    primary="События и мероприятия" 
                    secondary="Информация о предстоящих событиях" 
                  />
                  <Switch 
                    checked={notificationSettings.events}
                    onChange={handleToggleNotification('events')}
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Новости университета" 
                    secondary="Актуальные новости и объявления" 
                  />
                  <Switch 
                    checked={notificationSettings.news}
                    onChange={handleToggleNotification('news')}
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Новые сообщения" 
                    secondary="Уведомления о новых сообщениях" 
                  />
                  <Switch 
                    checked={notificationSettings.chat}
                    onChange={handleToggleNotification('chat')}
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </TabPanel>
        
        {/* Оформление */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Настройки оформления
            </Typography>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                mb: 3
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Тема оформления
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body1">
                  {theme === 'light' ? 'Светлая' : 'Темная'} тема
                </Typography>
                <Switch 
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  sx={{ ml: 2 }}
                />
              </Box>
            </Paper>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                mb: 3
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Язык интерфейса
              </Typography>
              
              <FormControl fullWidth variant="outlined" size="small" sx={{ maxWidth: 300 }}>
                <InputLabel id="language-select-label">Язык</InputLabel>
                <Select
                  labelId="language-select-label"
                  value={otherSettings.language}
                  onChange={handleLanguageChange}
                  label="Язык"
                  startAdornment={
                    <InputAdornment position="start">
                      <LanguageIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="ru">Русский</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="de">Deutsch</MenuItem>
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                </Select>
              </FormControl>
            </Paper>
            
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 2,
                border: '1px solid rgba(0, 0, 0, 0.12)'
              }}
            >
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Дополнительные настройки
              </Typography>
              
              <List>
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Автосохранение изменений" 
                    secondary="Автоматически сохранять черновики и изменения" 
                  />
                  <Switch 
                    checked={otherSettings.autoSave}
                    onChange={handleToggleOtherSetting('autoSave')}
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemText 
                    primary="Приватный профиль" 
                    secondary="Скрыть ваш профиль от других пользователей" 
                  />
                  <Switch 
                    checked={otherSettings.privateProfile}
                    onChange={handleToggleOtherSetting('privateProfile')}
                  />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Диалог изменения аватара */}
      <Dialog
        open={avatarDialogOpen}
        onClose={() => {
          setAvatarDialogOpen(false);
          setAvatarFile(null);
          setAvatarPreview('');
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Изменить аватар
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Avatar
              src={avatarPreview || user?.photoURL || ""}
              alt={user?.displayName || "User"}
              sx={{ width: 150, height: 150, mx: 'auto', mb: 3 }}
            />
            
            <Button
              variant="outlined"
              component="label"
              disabled={isUploading}
            >
              Выбрать изображение
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileSelect}
              />
            </Button>
            
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Поддерживаемые форматы: JPG, PNG. Максимальный размер: 5MB
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setAvatarDialogOpen(false);
              setAvatarFile(null);
              setAvatarPreview('');
            }} 
            color="inherit"
            disabled={isUploading}
          >
            Отмена
          </Button>
          <Button 
            variant="contained"
            onClick={handleAvatarChange}
            disabled={!avatarFile || isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог изменения пароля */}
      <Dialog 
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Изменить пароль
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Для смены пароля введите текущий пароль и новый пароль дважды
          </Typography>
          
          <TextField
            margin="dense"
            name="currentPassword"
            label="Текущий пароль"
            type={showPassword.current ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordForm.currentPassword}
            onChange={handlePasswordChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('current')}
                    edge="end"
                  >
                    {showPassword.current ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="dense"
            name="newPassword"
            label="Новый пароль"
            type={showPassword.new ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordForm.newPassword}
            onChange={handlePasswordChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('new')}
                    edge="end"
                  >
                    {showPassword.new ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <TextField
            margin="dense"
            name="confirmPassword"
            label="Подтверждение пароля"
            type={showPassword.confirm ? 'text' : 'password'}
            fullWidth
            variant="outlined"
            value={passwordForm.confirmPassword}
            onChange={handlePasswordChange}
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => handleTogglePasswordVisibility('confirm')}
                    edge="end"
                  >
                    {showPassword.confirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
            helperText="Пароль должен содержать не менее 6 символов"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)} color="inherit">
            Отмена
          </Button>
          <Button 
            variant="contained"
            onClick={handlePasswordSave}
            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомления */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default SettingsPage;
