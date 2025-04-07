import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  ButtonGroup,
  Checkbox,
  FormControlLabel,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  ArrowForwardIos as ArrowRightIcon,
  ArrowBackIos as ArrowLeftIcon,
  Today as TodayIcon,
  Sync as SyncIcon,
  CalendarViewDay as CalendarDayIcon,
  CalendarViewWeek as CalendarWeekIcon,
  CalendarViewMonth as CalendarMonthIcon
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format, startOfWeek, endOfWeek, addDays, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';

// Типы данных
interface LessonEvent {
  id: string;
  title: string;
  type: 'lecture' | 'seminar' | 'lab' | 'exam' | 'consultation' | 'other';
  dayOfWeek: number; // 0 - понедельник, 6 - воскресенье
  startTime: string;
  endTime: string;
  location: string;
  teacher: string;
  notes?: string;
  isRepeating: boolean; // еженедельно повторяющееся занятие
  date?: string; // для разовых событий
}

// Мок данных расписания теперь пустой массив
const mockSchedule: LessonEvent[] = [];

// Цвета для типов занятий
const getEventColor = (type: string) => {
  switch (type) {
    case 'lecture':
      return { bg: 'rgba(66, 133, 244, 0.1)', color: '#4285F4', border: '#4285F4' };
    case 'seminar':
      return { bg: 'rgba(52, 168, 83, 0.1)', color: '#34A853', border: '#34A853' };
    case 'lab':
      return { bg: 'rgba(251, 188, 4, 0.1)', color: '#FBBC04', border: '#FBBC04' };
    case 'exam':
      return { bg: 'rgba(234, 67, 53, 0.1)', color: '#EA4335', border: '#EA4335' };
    case 'consultation':
      return { bg: 'rgba(156, 39, 176, 0.1)', color: '#9C27B0', border: '#9C27B0' };
    default:
      return { bg: 'rgba(97, 97, 97, 0.1)', color: '#616161', border: '#616161' };
  }
};

// Преобразование типа события в текст
const getEventTypeText = (type: string) => {
  switch (type) {
    case 'lecture':
      return 'Лекция';
    case 'seminar':
      return 'Семинар';
    case 'lab':
      return 'Лабораторная';
    case 'exam':
      return 'Экзамен';
    case 'consultation':
      return 'Консультация';
    default:
      return 'Другое';
  }
};

const SchedulePage: React.FC = () => {
  const [events, setEvents] = useState<LessonEvent[]>(mockSchedule);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LessonEvent | null>(null);
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [tabValue, setTabValue] = useState(0);
  
  // Начало и конец текущей недели
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Массив дней текущей недели
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  
  // Новое событие
  const [newEvent, setNewEvent] = useState<Omit<LessonEvent, 'id'>>({
    title: '',
    type: 'lecture',
    dayOfWeek: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
    startTime: '09:00',
    endTime: '10:30',
    location: '',
    teacher: '',
    notes: '',
    isRepeating: true
  });
  
  // Placeholder message when no events
  const noEventsMessage = "Ваше расписание пусто. Добавьте занятия, чтобы видеть их здесь.";
  
  // Обработчики
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };
  
  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleOpenDialog = (event?: LessonEvent) => {
    if (event) {
      setEditingEvent(event);
      setNewEvent({
        title: event.title,
        type: event.type,
        dayOfWeek: event.dayOfWeek,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        teacher: event.teacher,
        notes: event.notes || '',
        isRepeating: event.isRepeating,
        date: event.date
      });
    } else {
      setEditingEvent(null);
      setNewEvent({
        title: '',
        type: 'lecture',
        dayOfWeek: new Date().getDay() === 0 ? 6 : new Date().getDay() - 1,
        startTime: '09:00',
        endTime: '10:30',
        location: '',
        teacher: '',
        notes: '',
        isRepeating: true
      });
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvent(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setNewEvent(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0],
        dayOfWeek: date.getDay() === 0 ? 6 : date.getDay() - 1
      }));
    }
  };
  
  const handleTimeChange = (time: Date | null, field: 'startTime' | 'endTime') => {
    if (time) {
      const timeString = format(time, 'HH:mm');
      setNewEvent(prev => ({ ...prev, [field]: timeString }));
    }
  };
  
  const handleSubmit = () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return;
    
    if (editingEvent) {
      // Обновление существующего события
      setEvents(prev => 
        prev.map(event => event.id === editingEvent.id ? { ...newEvent, id: event.id } : event)
      );
    } else {
      // Добавление нового события
      const newId = String(Date.now());
      setEvents(prev => [...prev, { ...newEvent, id: newId }]);
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };
  
  // Фильтрация событий для текущего представления
  const filteredEvents = events.filter(event => {
    if (viewMode === 'week') {
      // Для еженедельных событий
      if (event.isRepeating) {
        return true;
      }
      
      // Для разовых событий проверяем, попадает ли оно в текущую неделю
      if (event.date) {
        const eventDate = new Date(event.date);
        return eventDate >= weekStart && eventDate <= weekEnd;
      }
      
      return false;
    } else {
      // Режим дня - показываем события только для выбранного дня
      if (event.isRepeating) {
        return event.dayOfWeek === currentDate.getDay() - 1 || (currentDate.getDay() === 0 && event.dayOfWeek === 6);
      }
      
      if (event.date) {
        return isSameDay(new Date(event.date), currentDate);
      }
      
      return false;
    }
  });
  
  // Группировка событий по дням недели для недельного представления
  const eventsByDay = weekDays.map((day, index) => {
    return {
      date: day,
      events: filteredEvents.filter(event => 
        (event.isRepeating && event.dayOfWeek === index) || 
        (event.date && isSameDay(new Date(event.date), day))
      ).sort((a, b) => a.startTime.localeCompare(b.startTime))
    };
  });
  
  // When displaying empty schedule, show a helpful message
  if (filteredEvents.length === 0) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Расписание занятий
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <ButtonGroup variant="outlined" aria-label="view mode">
              <Button
                onClick={() => setViewMode('week')}
                variant={viewMode === 'week' ? 'contained' : 'outlined'}
                startIcon={<CalendarWeekIcon />}
              >
                Неделя
              </Button>
              <Button
                onClick={() => setViewMode('day')}
                variant={viewMode === 'day' ? 'contained' : 'outlined'}
                startIcon={<CalendarDayIcon />}
              >
                День
              </Button>
            </ButtonGroup>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Добавить событие
            </Button>
          </Box>
        </Box>
        
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 2, 
            bgcolor: 'var(--surface)',
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          {/* Calendar navigation elements */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={handlePrevWeek}>
                <ArrowLeftIcon />
              </IconButton>
              
              <Typography variant="h6" sx={{ mx: 1, fontWeight: 'medium' }}>
                {viewMode === 'week' 
                  ? `${format(weekStart, 'd MMM', { locale: ru })} - ${format(weekEnd, 'd MMM yyyy', { locale: ru })}`
                  : format(currentDate, 'd MMMM yyyy', { locale: ru })
                }
              </Typography>
              
              <IconButton onClick={handleNextWeek}>
                <ArrowRightIcon />
              </IconButton>
              
              <Button 
                startIcon={<TodayIcon />} 
                onClick={handleToday} 
                variant="outlined" 
                size="small"
                sx={{ ml: 1 }}
              >
                Сегодня
              </Button>
            </Box>
            
            <Tooltip title="Синхронизировать с Google Calendar">
              <IconButton>
                <SyncIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
        
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
          <Typography color="textSecondary" gutterBottom>
            {noEventsMessage}
          </Typography>
          <Button 
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ mt: 2 }}
          >
            Добавить первое занятие
          </Button>
        </Paper>
        
        {/* Keep the dialog for adding new events */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingEvent ? 'Редактировать событие' : 'Добавить событие'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1 }}>
              <TextField
                margin="dense"
                name="title"
                label="Название"
                fullWidth
                variant="outlined"
                value={newEvent.title}
                onChange={handleInputChange}
                required
                sx={{ mb: 2 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Тип</InputLabel>
                    <Select
                      name="type"
                      value={newEvent.type}
                      onChange={handleSelectChange}
                      label="Тип"
                    >
                      <MenuItem value="lecture">Лекция</MenuItem>
                      <MenuItem value="seminar">Семинар</MenuItem>
                      <MenuItem value="lab">Лабораторная</MenuItem>
                      <MenuItem value="exam">Экзамен</MenuItem>
                      <MenuItem value="consultation">Консультация</MenuItem>
                      <MenuItem value="other">Другое</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth margin="dense">
                    <InputLabel>День недели</InputLabel>
                    <Select
                      name="dayOfWeek"
                      value={newEvent.dayOfWeek}
                      onChange={handleSelectChange}
                      label="День недели"
                      disabled={!newEvent.isRepeating}
                    >
                      <MenuItem value={0}>Понедельник</MenuItem>
                      <MenuItem value={1}>Вторник</MenuItem>
                      <MenuItem value={2}>Среда</MenuItem>
                      <MenuItem value={3}>Четверг</MenuItem>
                      <MenuItem value={4}>Пятница</MenuItem>
                      <MenuItem value={5}>Суббота</MenuItem>
                      <MenuItem value={6}>Воскресенье</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                    <TimePicker
                      label="Время начала"
                      value={new Date(`2000-01-01T${newEvent.startTime}`)}
                      onChange={(date) => handleTimeChange(date, 'startTime')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                    <TimePicker
                      label="Время окончания"
                      value={new Date(`2000-01-01T${newEvent.endTime}`)}
                      onChange={(date) => handleTimeChange(date, 'endTime')}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
              
              <TextField
                margin="dense"
                name="location"
                label="Место проведения"
                fullWidth
                variant="outlined"
                value={newEvent.location}
                onChange={handleInputChange}
                sx={{ mb: 2, mt: 2 }}
              />
              
              <TextField
                margin="dense"
                name="teacher"
                label="Преподаватель"
                fullWidth
                variant="outlined"
                value={newEvent.teacher}
                onChange={handleInputChange}
                sx={{ mb: 2 }}
              />
              
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!newEvent.isRepeating}
                        onChange={(e) => setNewEvent(prev => ({
                          ...prev,
                          isRepeating: !e.target.checked
                        }))}
                      />
                    }
                    label="Разовое событие"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  {!newEvent.isRepeating && (
                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                      <DatePicker
                        label="Дата события"
                        value={newEvent.date ? new Date(newEvent.date) : null}
                        onChange={handleDateChange}
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </LocalizationProvider>
                  )}
                </Grid>
              </Grid>
              
              <TextField
                margin="dense"
                name="notes"
                label="Примечания"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={newEvent.notes}
                onChange={handleInputChange}
                sx={{ mt: 2 }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Отмена
            </Button>
            <Button 
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime}
            >
              {editingEvent ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Расписание занятий
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ButtonGroup variant="outlined" aria-label="view mode">
            <Button
              onClick={() => setViewMode('week')}
              variant={viewMode === 'week' ? 'contained' : 'outlined'}
              startIcon={<CalendarWeekIcon />}
            >
              Неделя
            </Button>
            <Button
              onClick={() => setViewMode('day')}
              variant={viewMode === 'day' ? 'contained' : 'outlined'}
              startIcon={<CalendarDayIcon />}
            >
              День
            </Button>
          </ButtonGroup>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Добавить событие
          </Button>
        </Box>
      </Box>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2, 
          bgcolor: 'var(--surface)',
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handlePrevWeek}>
              <ArrowLeftIcon />
            </IconButton>
            
            <Typography variant="h6" sx={{ mx: 1, fontWeight: 'medium' }}>
              {viewMode === 'week' 
                ? `${format(weekStart, 'd MMM', { locale: ru })} - ${format(weekEnd, 'd MMM yyyy', { locale: ru })}`
                : format(currentDate, 'd MMMM yyyy', { locale: ru })
              }
            </Typography>
            
            <IconButton onClick={handleNextWeek}>
              <ArrowRightIcon />
            </IconButton>
            
            <Button 
              startIcon={<TodayIcon />} 
              onClick={handleToday} 
              variant="outlined" 
              size="small"
              sx={{ ml: 1 }}
            >
              Сегодня
            </Button>
          </Box>
          
          <Tooltip title="Синхронизировать с Google Calendar">
            <IconButton>
              <SyncIcon />
            </IconButton>
          </Tooltip>
        </Box>
        
        {viewMode === 'week' && (
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mt: 1 }}
          >
            {weekDays.map((day, index) => (
              <Tab 
                key={index} 
                label={
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {format(day, 'EE', { locale: ru })}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: isToday(day) ? 'bold' : 'regular',
                        color: isToday(day) ? 'primary.main' : 'inherit'
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                  </Box>
                } 
              />
            ))}
          </Tabs>
        )}
      </Paper>
      
      {viewMode === 'week' ? (
        <TabPanel 
          value={tabValue} 
          events={eventsByDay[tabValue].events}
          date={eventsByDay[tabValue].date}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteEvent}
        />
      ) : (
        <DailyView 
          events={filteredEvents.sort((a, b) => a.startTime.localeCompare(b.startTime))}
          date={currentDate}
          onEdit={handleOpenDialog}
          onDelete={handleDeleteEvent}
        />
      )}
      
      {/* Диалог добавления/редактирования события */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingEvent ? 'Редактировать событие' : 'Добавить событие'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              name="title"
              label="Название"
              fullWidth
              variant="outlined"
              value={newEvent.title}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Тип</InputLabel>
                  <Select
                    name="type"
                    value={newEvent.type}
                    onChange={handleSelectChange}
                    label="Тип"
                  >
                    <MenuItem value="lecture">Лекция</MenuItem>
                    <MenuItem value="seminar">Семинар</MenuItem>
                    <MenuItem value="lab">Лабораторная</MenuItem>
                    <MenuItem value="exam">Экзамен</MenuItem>
                    <MenuItem value="consultation">Консультация</MenuItem>
                    <MenuItem value="other">Другое</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>День недели</InputLabel>
                  <Select
                    name="dayOfWeek"
                    value={newEvent.dayOfWeek}
                    onChange={handleSelectChange}
                    label="День недели"
                    disabled={!newEvent.isRepeating}
                  >
                    <MenuItem value={0}>Понедельник</MenuItem>
                    <MenuItem value={1}>Вторник</MenuItem>
                    <MenuItem value={2}>Среда</MenuItem>
                    <MenuItem value={3}>Четверг</MenuItem>
                    <MenuItem value={4}>Пятница</MenuItem>
                    <MenuItem value={5}>Суббота</MenuItem>
                    <MenuItem value={6}>Воскресенье</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                  <TimePicker
                    label="Время начала"
                    value={new Date(`2000-01-01T${newEvent.startTime}`)}
                    onChange={(date) => handleTimeChange(date, 'startTime')}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                  <TimePicker
                    label="Время окончания"
                    value={new Date(`2000-01-01T${newEvent.endTime}`)}
                    onChange={(date) => handleTimeChange(date, 'endTime')}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            
            <TextField
              margin="dense"
              name="location"
              label="Место проведения"
              fullWidth
              variant="outlined"
              value={newEvent.location}
              onChange={handleInputChange}
              sx={{ mb: 2, mt: 2 }}
            />
            
            <TextField
              margin="dense"
              name="teacher"
              label="Преподаватель"
              fullWidth
              variant="outlined"
              value={newEvent.teacher}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={!newEvent.isRepeating}
                      onChange={(e) => setNewEvent(prev => ({
                        ...prev,
                        isRepeating: !e.target.checked
                      }))}
                    />
                  }
                  label="Разовое событие"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                {!newEvent.isRepeating && (
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                    <DatePicker
                      label="Дата события"
                      value={newEvent.date ? new Date(newEvent.date) : null}
                      onChange={handleDateChange}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                )}
              </Grid>
            </Grid>
            
            <TextField
              margin="dense"
              name="notes"
              label="Примечания"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={newEvent.notes}
              onChange={handleInputChange}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!newEvent.title || !newEvent.startTime || !newEvent.endTime}
          >
            {editingEvent ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface TabPanelProps {
  value: number;
  events: LessonEvent[];
  date: Date;
  onEdit: (event: LessonEvent) => void;
  onDelete: (id: string) => void;
}

const TabPanel: React.FC<TabPanelProps> = ({ events, date, onEdit, onDelete }) => {
  const isTodays = isToday(date);
  
  if (events.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'var(--surface)',
          border: isTodays ? '1px solid var(--primary)' : '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Typography color="textSecondary" gutterBottom>
          Занятий нет
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {isTodays ? 'У вас свободный день!' : 'Добавьте занятия в расписание'}
        </Typography>
      </Paper>
    );
  }
  
  return (
    <List disablePadding>
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          isToday={isTodays}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </List>
  );
};

interface DailyViewProps {
  events: LessonEvent[];
  date: Date;
  onEdit: (event: LessonEvent) => void;
  onDelete: (id: string) => void;
}

const DailyView: React.FC<DailyViewProps> = ({ events, date, onEdit, onDelete }) => {
  const isTodays = isToday(date);
  
  if (events.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: 'var(--surface)',
          border: isTodays ? '1px solid var(--primary)' : '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Typography color="textSecondary" gutterBottom>
          Занятий нет
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {isTodays ? 'У вас свободный день!' : 'Добавьте занятия в расписание'}
        </Typography>
      </Paper>
    );
  }
  
  return (
    <List disablePadding>
      {events.map((event) => (
        <EventItem
          key={event.id}
          event={event}
          isToday={isTodays}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </List>
  );
};

interface EventItemProps {
  event: LessonEvent;
  isToday: boolean;
  onEdit: (event: LessonEvent) => void;
  onDelete: (id: string) => void;
}

const EventItem: React.FC<EventItemProps> = ({ event, isToday, onEdit, onDelete }) => {
  const eventColors = getEventColor(event.type);
  
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 2,
        overflow: 'hidden',
        border: isToday 
          ? `1px solid ${eventColors.border}`
          : '1px solid rgba(0, 0, 0, 0.12)',
        bgcolor: isToday ? eventColors.bg : 'var(--surface)'
      }}
    >
      <ListItem
        sx={{
          borderLeft: `4px solid ${eventColors.border}`,
          py: 2
        }}
        secondaryAction={
          <Box sx={{ display: 'flex' }}>
            <IconButton edge="end" aria-label="edit" onClick={() => onEdit(event)}>
              <EditIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => onDelete(event.id)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1, pr: 6 }}>
          <Box sx={{
            minWidth: 65,
            textAlign: 'center',
            p: 1,
            mr: 2,
            bgcolor: eventColors.bg,
            borderRadius: 1,
            color: eventColors.color
          }}>
            {event.startTime}
            <Divider sx={{ my: 0.5, borderColor: eventColors.color }} />
            {event.endTime}
          </Box>
          
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="h6">
                {event.title}
              </Typography>
              <Chip 
                label={getEventTypeText(event.type)}
                size="small"
                sx={{ 
                  ml: 1,
                  bgcolor: eventColors.bg,
                  color: eventColors.color,
                  borderRadius: 1
                }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 0.5, md: 2 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="textSecondary">
                  {event.location}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="textSecondary">
                  {event.teacher}
                </Typography>
              </Box>
            </Box>
            
            {event.notes && (
              <Typography 
                variant="body2" 
                sx={{ mt: 1, color: 'text.secondary', fontStyle: 'italic' }}
              >
                {event.notes}
              </Typography>
            )}
          </Box>
        </Box>
      </ListItem>
    </Paper>
  );
};

export default SchedulePage;
