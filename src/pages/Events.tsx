import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CardActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  LocalActivity as ActivityIcon,
  Share as ShareIcon,
  Add as AddIcon,
  OpenInNew as OpenInNewIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  FilterList as FilterIcon,
  SortByAlpha as SortIcon
} from '@mui/icons-material';
import { format, isSameDay, isPast, isToday, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { SelectChangeEvent } from '@mui/material/Select'; // Add this import for proper typing

// Типы данных
interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  organizer: string;
  image?: string;
  category: 'educational' | 'cultural' | 'sports' | 'career' | 'other';
  participants: number;
  maxParticipants?: number;
  isRegistered: boolean;
  isFavorite: boolean;
  tags: string[];
}

// Пустой массив для событий вместо моковых данных
const mockEvents: Event[] = [];

// Категории цветов
const getCategoryColor = (category: string) => {
  switch (category) {
    case 'educational':
      return { main: '#4285F4', light: 'rgba(66, 133, 244, 0.1)' };
    case 'cultural':
      return { main: '#9C27B0', light: 'rgba(156, 39, 176, 0.1)' };
    case 'sports':
      return { main: '#34A853', light: 'rgba(52, 168, 83, 0.1)' };
    case 'career':
      return { main: '#FBBC04', light: 'rgba(251, 188, 4, 0.1)' };
    default:
      return { main: '#EA4335', light: 'rgba(234, 67, 53, 0.1)' };
  }
};

// Названия категорий
const getCategoryName = (category: string) => {
  switch (category) {
    case 'educational':
      return 'Образование';
    case 'cultural':
      return 'Культура';
    case 'sports':
      return 'Спорт';
    case 'career':
      return 'Карьера';
    default:
      return 'Другое';
  }
};

// Форматирование даты и времени
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'dd MMMM yyyy, HH:mm', { locale: ru });
};

// Remove unused function or add eslint-disable comment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'd MMM', { locale: ru });
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'HH:mm', { locale: ru });
};

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('date');
  const [tabValue, setTabValue] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [registerDialog, setRegisterDialog] = useState(false);
  const [createEventDialog, setCreateEventDialog] = useState(false);
  
  // Новое событие
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id'>>({
    title: '',
    description: '',
    startDate: new Date().toISOString(),
    location: '',
    organizer: '',
    category: 'educational',
    participants: 0,
    isRegistered: false,
    isFavorite: false,
    tags: []
  });
  
  // Обработчики
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenDetails = (event: Event) => {
    setSelectedEvent(event);
    setDetailsDialog(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsDialog(false);
  };
  
  const handleOpenRegister = () => {
    setRegisterDialog(true);
    setDetailsDialog(false);
  };
  
  const handleCloseRegister = () => {
    setRegisterDialog(false);
  };
  
  const handleOpenCreateEvent = () => {
    setCreateEventDialog(true);
  };
  
  const handleCloseCreateEvent = () => {
    setCreateEventDialog(false);
  };
  
  const handleRegisterEvent = () => {
    if (selectedEvent) {
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === selectedEvent.id ? { ...event, isRegistered: true } : event
        )
      );
      setSelectedEvent({ ...selectedEvent, isRegistered: true });
      setRegisterDialog(false);
      setDetailsDialog(true);
    }
  };
  
  const handleToggleFavorite = (id: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === id ? { ...event, isFavorite: !event.isFavorite } : event
      )
    );
    
    if (selectedEvent?.id === id) {
      setSelectedEvent({
        ...selectedEvent,
        isFavorite: !selectedEvent.isFavorite
      });
    }
  };
  
  const handleCreateEvent = () => {
    // Validate form
    if (!newEvent.title || !newEvent.startDate || !newEvent.location) {
      return;
    }
    
    const event: Event = {
      ...newEvent,
      id: `event_${Date.now()}`,
      participants: 0,
      isRegistered: false,
      isFavorite: false
    };
    
    setEvents([event, ...events]);
    setCreateEventDialog(false);
    
    // Reset form
    setNewEvent({
      title: '',
      description: '',
      startDate: new Date().toISOString(),
      location: '',
      organizer: '',
      category: 'educational',
      participants: 0,
      isRegistered: false,
      isFavorite: false,
      tags: []
    });
  };
  
  const handleEventInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };
  
  // Fix this function to use SelectChangeEvent
  const handleEventSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
      const newTag = (e.target as HTMLInputElement).value.trim();
      setNewEvent(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      (e.target as HTMLInputElement).value = '';
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setNewEvent(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };
  
  // Фильтрация событий
  const filteredEvents = events.filter(event => {
    // Поиск
    const matchesSearch = searchTerm === '' || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Фильтр по категории
    const matchesCategory = selectedCategory === '' || event.category === selectedCategory;
    
    // Фильтр по вкладке
    const isEventPast = isPast(new Date(event.startDate));
    
    const matchesTab = 
      (tabValue === 0) || // Все события
      (tabValue === 1 && !isEventPast) || // Предстоящие
      (tabValue === 2 && event.isRegistered) || // Мои события
      (tabValue === 3 && event.isFavorite); // Избранные
    
    return matchesSearch && matchesCategory && matchesTab;
  });
  
  // Сортировка событий
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortOption) {
      case 'date':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'popularity':
        return b.participants - a.participants;
      case 'name':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  // Группировка событий по дате для списков
  const today = new Date();
  const tomorrow = addDays(today, 1);
  
  const todayEvents = sortedEvents.filter(event => isToday(new Date(event.startDate)));
  const tomorrowEvents = sortedEvents.filter(event => 
    !isToday(new Date(event.startDate)) && isSameDay(new Date(event.startDate), tomorrow)
  );
  const upcomingEvents = sortedEvents.filter(event => 
    !isToday(new Date(event.startDate)) && 
    !isSameDay(new Date(event.startDate), tomorrow) &&
    !isPast(new Date(event.startDate))
  );
  const pastEvents = sortedEvents.filter(event => isPast(new Date(event.endDate || event.startDate)));
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Мероприятия и события
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateEvent}
        >
          Создать событие
        </Button>
      </Box>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          borderRadius: 2, 
          bgcolor: 'var(--surface)',
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            placeholder="Поиск мероприятий..."
            variant="outlined"
            fullWidth
            size="medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, minWidth: { xs: '100%', md: '50%' } }}>
            <FormControl variant="outlined" size="medium" sx={{ minWidth: 150, flexGrow: 1 }}>
              <InputLabel>Категория</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as string)}
                label="Категория"
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="">Все категории</MenuItem>
                <MenuItem value="educational">Образование</MenuItem>
                <MenuItem value="cultural">Культура</MenuItem>
                <MenuItem value="sports">Спорт</MenuItem>
                <MenuItem value="career">Карьера</MenuItem>
                <MenuItem value="other">Другое</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="medium" sx={{ minWidth: 150, flexGrow: 1 }}>
              <InputLabel>Сортировка</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as string)}
                label="Сортировка"
                startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="date">По дате</MenuItem>
                <MenuItem value="popularity">По популярности</MenuItem>
                <MenuItem value="name">По названию</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Tabs 
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Все события" />
          <Tab label="Предстоящие" />
          <Tab label="Мои события" />
          <Tab label="Избранное" />
        </Tabs>
      </Paper>
      
      {/* Если нет событий */}
      {sortedEvents.length === 0 && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'var(--surface)',
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            События не найдены
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Создайте новое событие или проверьте другие разделы
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            sx={{ mt: 2 }}
            startIcon={<AddIcon />}
            onClick={handleOpenCreateEvent}
          >
            Создать событие
          </Button>
        </Paper>
      )}
      
      {/* Сегодняшние события */}
      {tabValue !== 3 && todayEvents.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Сегодня
            </Typography>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {todayEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard 
                  event={event} 
                  onOpenDetails={handleOpenDetails}
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Завтрашние события */}
      {tabValue !== 3 && tomorrowEvents.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Завтра
            </Typography>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {tomorrowEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard 
                  event={event} 
                  onOpenDetails={handleOpenDetails} 
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Предстоящие события */}
      {(tabValue === 0 || tabValue === 1) && upcomingEvents.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Предстоящие
            </Typography>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {upcomingEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard 
                  event={event} 
                  onOpenDetails={handleOpenDetails} 
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Прошедшие события */}
      {(tabValue === 0) && pastEvents.length > 0 && (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EventIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              Прошедшие
            </Typography>
          </Box>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {pastEvents.map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard 
                  event={event} 
                  onOpenDetails={handleOpenDetails} 
                  onToggleFavorite={handleToggleFavorite}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}
      
      {/* Мои события */}
      {tabValue === 2 && sortedEvents.length > 0 && (
        <Grid container spacing={3}>
          {sortedEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard 
                event={event} 
                onOpenDetails={handleOpenDetails} 
                onToggleFavorite={handleToggleFavorite}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Избранные события */}
      {tabValue === 3 && sortedEvents.length > 0 && (
        <Grid container spacing={3}>
          {sortedEvents.map((event) => (
            <Grid item xs={12} sm={6} md={4} key={event.id}>
              <EventCard 
                event={event} 
                onOpenDetails={handleOpenDetails} 
                onToggleFavorite={handleToggleFavorite}
              />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Диалог с подробностями события */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'var(--surface)'
          }
        }}
      >
        {selectedEvent && (
          <>
            <DialogContent sx={{ p: 0 }}>
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height={240}
                  image={selectedEvent.image || 'https://source.unsplash.com/random/800x400/?event'}
                  alt={selectedEvent.title}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <IconButton
                    onClick={handleCloseDetails}
                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.5)', color: 'white' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
                
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16
                  }}
                >
                  <Chip
                    label={getCategoryName(selectedEvent.category)}
                    sx={{
                      bgcolor: getCategoryColor(selectedEvent.category).main,
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>
              </Box>
              
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  {selectedEvent.title}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body1" paragraph>
                        {selectedEvent.description}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                        {selectedEvent.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(66, 133, 244, 0.1)',
                              color: 'var(--primary)'
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <List disablePadding>
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <CalendarIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Дата и время"
                            secondary={
                              selectedEvent.endDate
                                ? `${formatDateTime(selectedEvent.startDate)} - ${formatTime(selectedEvent.endDate)}`
                                : formatDateTime(selectedEvent.startDate)
                            }
                          />
                        </ListItem>
                        
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <LocationIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Место проведения"
                            secondary={selectedEvent.location}
                          />
                        </ListItem>
                        
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <PeopleIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Участники"
                            secondary={
                              selectedEvent.maxParticipants
                                ? `${selectedEvent.participants} из ${selectedEvent.maxParticipants}`
                                : selectedEvent.participants
                            }
                          />
                        </ListItem>
                        
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <ActivityIcon color="action" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Организатор"
                            secondary={selectedEvent.organizer}
                          />
                        </ListItem>
                      </List>
                      
                      <Box sx={{ mt: 2 }}>
                        {isPast(new Date(selectedEvent.startDate)) ? (
                          <Button
                            variant="outlined"
                            fullWidth
                            disabled
                          >
                            Событие завершено
                          </Button>
                        ) : selectedEvent.isRegistered ? (
                          <Button
                            variant="contained"
                            fullWidth
                            color="success"
                            disabled
                          >
                            Вы зарегистрированы
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={handleOpenRegister}
                          >
                            Зарегистрироваться
                          </Button>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, pt: 0 }}>
              <Button
                startIcon={<ShareIcon />}
              >
                Поделиться
              </Button>
              <Button
                startIcon={selectedEvent.isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                onClick={() => handleToggleFavorite(selectedEvent.id)}
                color={selectedEvent.isFavorite ? 'primary' : 'inherit'}
              >
                {selectedEvent.isFavorite ? 'В избранном' : 'Добавить в избранное'}
              </Button>
              {!isPast(new Date(selectedEvent.startDate)) && !selectedEvent.isRegistered && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenRegister}
                >
                  Зарегистрироваться
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Диалог регистрации на событие */}
      <Dialog
        open={registerDialog}
        onClose={handleCloseRegister}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'var(--surface)'
          }
        }}
      >
        {selectedEvent && (
          <>
            <DialogTitle>
              Регистрация на мероприятие
              <IconButton
                aria-label="close"
                onClick={handleCloseRegister}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography variant="h6" gutterBottom>
                {selectedEvent.title}
              </Typography>
              
              <List>
                <ListItem disableGutters>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Дата и время"
                    secondary={
                      selectedEvent.endDate
                        ? `${formatDateTime(selectedEvent.startDate)} - ${formatTime(selectedEvent.endDate)}`
                        : formatDateTime(selectedEvent.startDate)
                    }
                  />
                </ListItem>
                
                <ListItem disableGutters>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Место проведения"
                    secondary={selectedEvent.location}
                  />
                </ListItem>
              </List>
              
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                Для участия в мероприятии необходимо заполнить следующую информацию:
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Фамилия и имя"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  placeholder="Введите фамилию и имя"
                />
                
                <TextField
                  label="Email"
                  type="email"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  placeholder="Введите email"
                />
                
                <TextField
                  label="Телефон"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  placeholder="Введите номер телефона"
                />
                
                {selectedEvent.category === 'educational' && (
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Факультет</InputLabel>
                    <Select
                      label="Факультет"
                      defaultValue=""
                    >
                      <MenuItem value="">Выберите факультет</MenuItem>
                      <MenuItem value="ivt">Информатика и вычислительная техника</MenuItem>
                      <MenuItem value="economical">Экономика и управление</MenuItem>
                      <MenuItem value="philology">Филологический</MenuItem>
                      <MenuItem value="physics">Физический</MenuItem>
                    </Select>
                  </FormControl>
                )}
                
                <TextField
                  label="Комментарий (опционально)"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  multiline
                  rows={3}
                  placeholder="Дополнительная информация"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseRegister} color="inherit">
                Отмена
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleRegisterEvent}
              >
                Зарегистрироваться
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Диалог создания нового события */}
      <Dialog
        open={createEventDialog}
        onClose={handleCloseCreateEvent}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'var(--surface)'
          }
        }}
      >
        <DialogTitle>
          Создать новое событие
          <IconButton
            aria-label="close"
            onClick={handleCloseCreateEvent}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="title"
                label="Название события"
                placeholder="Введите название события"
                fullWidth
                value={newEvent.title}
                onChange={handleEventInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Описание"
                placeholder="Подробное описание события"
                fullWidth
                multiline
                rows={4}
                value={newEvent.description}
                onChange={handleEventInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="startDate"
                label="Дата и время начала"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newEvent.startDate.slice(0, 16)}
                onChange={handleEventInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="endDate"
                label="Дата и время окончания"
                type="datetime-local"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newEvent.endDate?.slice(0, 16) || ""}
                onChange={handleEventInputChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="location"
                label="Место проведения"
                placeholder="Введите место проведения"
                fullWidth
                value={newEvent.location}
                onChange={handleEventInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="organizer"
                label="Организатор"
                placeholder="Введите название организатора"
                fullWidth
                value={newEvent.organizer}
                onChange={handleEventInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Категория</InputLabel>
                <Select
                  name="category"
                  value={newEvent.category}
                  onChange={handleEventSelectChange}
                  label="Категория"
                >
                  <MenuItem value="educational">Образование</MenuItem>
                  <MenuItem value="cultural">Культура</MenuItem>
                  <MenuItem value="sports">Спорт</MenuItem>
                  <MenuItem value="career">Карьера</MenuItem>
                  <MenuItem value="other">Другое</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="maxParticipants"
                label="Макс. количество участников"
                type="number"
                placeholder="Оставьте пустым, если не ограничено"
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
                onChange={(e) => setNewEvent(prev => ({
                  ...prev,
                  maxParticipants: parseInt(e.target.value) || undefined
                }))}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Теги
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {newEvent.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(66, 133, 244, 0.1)',
                      color: 'var(--primary)'
                    }}
                  />
                ))}
              </Box>
              
              <TextField
                placeholder="Введите тег и нажмите Enter"
                fullWidth
                onKeyPress={handleAddTag}
                helperText="Добавьте ключевые слова для поиска, например: Лекция, IT, Мастер-класс"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                border: '1px dashed rgba(0, 0, 0, 0.23)', 
                borderRadius: 1, 
                p: 2, 
                textAlign: 'center'
              }}>
                <Button 
                  component="label" 
                  variant="outlined"
                  startIcon={<AddIcon />}
                >
                  Загрузить изображение
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                  />
                </Button>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Рекомендуемый размер: 800x400 px, формат: JPG, PNG
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateEvent} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleCreateEvent} 
            variant="contained" 
            color="primary"
            disabled={!newEvent.title || !newEvent.location || !newEvent.organizer}
          >
            Создать событие
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface EventCardProps {
  event: Event;
  onOpenDetails: (event: Event) => void;
  onToggleFavorite: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onOpenDetails, onToggleFavorite }) => {
  const categoryColor = getCategoryColor(event.category);
  const eventDate = new Date(event.startDate);
  const isPastEvent = isPast(eventDate);
  
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        border: '1px solid rgba(0, 0, 0, 0.12)',
        position: 'relative',
        opacity: isPastEvent ? 0.8 : 1,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      {isToday(eventDate) && (
        <Chip
          label="Сегодня"
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 1,
            bgcolor: 'var(--primary)',
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      )}
      
      <CardMedia
        component="img"
        height={140}
        image={event.image || 'https://source.unsplash.com/random/800x400/?event'}
        alt={event.title}
        sx={{ position: 'relative' }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          right: 12
        }}
      >
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(event.id);
          }}
          sx={{ 
            bgcolor: 'white',
            '&:hover': { bgcolor: 'white' }
          }}
        >
          {event.isFavorite ? 
            <FavoriteIcon color="primary" /> : 
            <FavoriteBorderIcon color="action" />
          }
        </IconButton>
      </Box>
      
      <Box
        sx={{
          position: 'absolute',
          top: 110,
          left: 12,
          bgcolor: categoryColor.main,
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 'medium',
          px: 1,
          py: 0.5,
          borderRadius: 1
        }}
      >
        {getCategoryName(event.category)}
      </Box>
      
      <CardContent sx={{ flexGrow: 1, pt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {event.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {formatDateTime(event.startDate)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary" noWrap>
            {event.location}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon fontSize="small" color="action" sx={{ mr: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {event.maxParticipants 
              ? `${event.participants}/${event.maxParticipants} участников` 
              : `${event.participants} участников`}
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {event.description}
        </Typography>
      </CardContent>
      
      <Divider />
      
      <CardActions sx={{ justifyContent: 'space-between' }}>
        <Box>
          {event.isRegistered && !isPastEvent && (
            <Chip 
              label="Вы участвуете" 
              size="small" 
              color="success"
            />
          )}
        </Box>
        <Button 
          size="small"
          endIcon={<OpenInNewIcon />}
          onClick={() => onOpenDetails(event)}
        >
          Подробнее
        </Button>
      </CardActions>
    </Card>
  );
};

export default EventsPage;
