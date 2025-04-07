import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Chip,
  InputAdornment,
  IconButton,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Divider,
  ListItem,
  ListItemText,
  List
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useTaskStore, Task } from '../store/taskStore';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Вспомогательная функция для форматирования даты
const formatDate = (dateString: string) => {
  try {
    return format(parseISO(dateString), 'dd MMMM yyyy', { locale: ru });
  } catch (error) {
    return dateString;
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`task-tabpanel-${index}`}
      aria-labelledby={`task-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const TasksPage: React.FC = () => {
  // Get tasks from taskStore, but don't use mock data
  const { tasks: storedTasks, addTask, updateTask, deleteTask, toggleComplete } = useTaskStore();
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Initialize with empty tasks list
  useEffect(() => {
    // If no tasks in store, initialize with empty array
    if (storedTasks.length === 0) {
      setTasks([]);
    } else {
      setTasks(storedTasks);
    }
  }, [storedTasks]);
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('deadline');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  
  const [newTask, setNewTask] = useState<Omit<Task, 'id' | 'createdAt'>>({
    title: '',
    description: '',
    deadline: new Date().toISOString().split('T')[0],
    completed: false,
    subject: '',
    priority: 'medium',
    status: 'pending'
  });
  
  // Получаем уникальные предметы для фильтрации
  const subjects = Array.from(new Set(tasks.map(task => task.subject))).filter(Boolean);
  
  // Обработка фильтров и поиска
  const filteredTasks = tasks.filter(task => {
    // Фильтр по статусу (вкладки)
    if (tabValue === 1 && !task.completed) return false;
    if (tabValue === 2 && task.completed) return false;
    
    // Поиск по тексту
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      searchTerm === '' || 
      task.title.toLowerCase().includes(searchLower) || 
      task.description.toLowerCase().includes(searchLower);
    
    // Фильтры
    const matchesSubject = filterSubject === '' || task.subject === filterSubject;
    const matchesPriority = filterPriority === '' || task.priority === filterPriority;
    
    return matchesSearch && matchesSubject && matchesPriority;
  });
  
  // Сортировка задач
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortOption) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'priority':
        const priorityMap: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return priorityMap[a.priority] - priorityMap[b.priority];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
  
  const handleOpenDialog = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setNewTask({
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        completed: task.completed,
        subject: task.subject,
        priority: task.priority,
        status: task.status
      });
    } else {
      setEditingTask(null);
      setNewTask({
        title: '',
        description: '',
        deadline: new Date().toISOString().split('T')[0],
        completed: false,
        subject: '',
        priority: 'medium',
        status: 'pending'
      });
    }
    setOpenDialog(true);
  };
  
  // Helper function to handle Button onClick events
  const handleAddTask = () => {
    handleOpenDialog();
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };
  
  const handleDateChange = (date: Date | null) => {
    if (date) {
      setNewTask(prev => ({ 
        ...prev, 
        deadline: date.toISOString().split('T')[0] 
      }));
    }
  };
  
  const handleTaskSubmit = () => {
    if (!newTask.title || !newTask.deadline) return;
    
    if (editingTask) {
      updateTask(editingTask.id, newTask);
    } else {
      addTask(newTask);
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteTask = (id: string) => {
    deleteTask(id);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const getTaskColor = (priority: string, deadline: string) => {
    const today = new Date().toISOString().split('T')[0];
    const isToday = deadline === today;
    
    if (isToday) return 'rgba(234, 67, 53, 0.1)';
    
    return priority === 'high' 
      ? 'rgba(234, 67, 53, 0.05)'
      : priority === 'medium'
      ? 'rgba(251, 188, 4, 0.05)'
      : 'rgba(52, 168, 83, 0.05)';
  };
  
  // Add a placeholder when no tasks
  if (filteredTasks.length === 0) {
    return (
      <Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddTask}
        >
          Добавить задачу
        </Button>
        
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
          {/* ...search and filter components... */}
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
          <Typography variant="body1" color="textSecondary">
            У вас пока нет задач
          </Typography>
          <Button 
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            sx={{ mt: 2 }}
          >
            Добавить первую задачу
          </Button>
        </Paper>
      </Box>
    );
  }
  return (
    <Box>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />} 
        onClick={handleAddTask}
      >
        Добавить задачу
      </Button>
      
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mt: 2,
          mb: 3,
          borderRadius: 2, 
          bgcolor: 'var(--surface)',
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            placeholder="Поиск задач..."
            variant="outlined"
            fullWidth
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
          
          <Box sx={{ display: 'flex', gap: 2, minWidth: { xs: '100%', md: '60%' } }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Сортировка</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as string)}
                label="Сортировка"
                startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="deadline">По сроку</MenuItem>
                <MenuItem value="priority">По приоритету</MenuItem>
                <MenuItem value="title">По названию</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Предмет</InputLabel>
              <Select
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value as string)}
                label="Предмет"
                startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="">Все предметы</MenuItem>
                {subjects.map(subject => (
                  <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Приоритет</InputLabel>
              <Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as string)}
                label="Приоритет"
              >
                <MenuItem value="">Любой</MenuItem>
                <MenuItem value="high">Высокий</MenuItem>
                <MenuItem value="medium">Средний</MenuItem>
                <MenuItem value="low">Низкий</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Все задачи" />
          <Tab label="Выполненные" />
          <Tab label="Активные" />
        </Tabs>
      </Paper>
      
      <TabPanel value={tabValue} index={0}>
        <TasksList 
          tasks={sortedTasks}
          onToggleComplete={toggleComplete}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleOpenDialog}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <TasksList 
          tasks={sortedTasks}
          onToggleComplete={toggleComplete}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleOpenDialog}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <TasksList 
          tasks={sortedTasks}
          onToggleComplete={toggleComplete}
          onDeleteTask={handleDeleteTask}
          onEditTask={handleOpenDialog}
        />
      </TabPanel>
      
      {/* Диалог добавления/редактирования задачи */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'Редактировать задачу' : 'Добавить новую задачу'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Название задачи"
            type="text"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={handleChange}
            required
            sx={{ mb: 2, mt: 1 }}
          />
          
          <TextField
            margin="dense"
            name="description"
            label="Описание"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newTask.description}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <DatePicker
                  label="Дедлайн"
                  value={parseISO(newTask.deadline)}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true, margin: 'dense' } }}
                  format="dd.MM.yyyy"
                />
              </LocalizationProvider>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Приоритет</InputLabel>
                <Select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleSelectChange}
                  label="Приоритет"
                >
                  <MenuItem value="low">Низкий</MenuItem>
                  <MenuItem value="medium">Средний</MenuItem>
                  <MenuItem value="high">Высокий</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <TextField
            margin="dense"
            name="subject"
            label="Предмет"
            type="text"
            fullWidth
            variant="outlined"
            value={newTask.subject}
            onChange={handleChange}
            sx={{ mt: 1 }}
          />
          
          {editingTask && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={newTask.completed}
                  onChange={(e) => setNewTask(prev => ({ ...prev, completed: e.target.checked }))}
                />
              }
              label="Задача выполнена"
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleTaskSubmit} 
            variant="contained" 
            color="primary"
            disabled={!newTask.title || !newTask.deadline}
          >
            {editingTask ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

interface TasksListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onEditTask: (task: Task) => void;
}

const TasksList: React.FC<TasksListProps> = ({ 
  tasks, 
  onToggleComplete, 
  onDeleteTask, 
  onEditTask 
}) => {
  if (tasks.length === 0) {
    return (
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
        <Typography variant="body1" color="textSecondary">
          Задачи не найдены
        </Typography>
      </Paper>
    );
  }
  
  return (
    <List disablePadding>
      {tasks.map((task) => {
        const today = new Date().toISOString().split('T')[0];
        const isToday = task.deadline === today;
        const isPastDue = task.deadline < today && !task.completed;
        
        return (
          <Paper
            key={task.id}
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 2,
              bgcolor: task.completed 
                ? 'rgba(52, 168, 83, 0.05)' 
                : isPastDue 
                ? 'rgba(234, 67, 53, 0.1)' 
                : isToday 
                ? 'rgba(251, 188, 4, 0.1)' 
                : 'var(--surface)',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              opacity: task.completed ? 0.8 : 1,
              transition: 'all 0.2s ease',
            }}
          >
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox 
                  checked={task.completed}
                  onChange={() => onToggleComplete(task.id)}
                  sx={{ 
                    mr: 1,
                    color: 'var(--text-secondary)',
                    '&.Mui-checked': {
                      color: 'var(--secondary)',
                    },
                  }}
                />
                
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? 'var(--text-secondary)' : 'var(--text-primary)',
                      }}
                    >
                      {task.title}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => onEditTask(task)}
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        size="small" 
                        onClick={() => onDeleteTask(task.id)}
                        sx={{ color: 'var(--text-secondary)' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      mt: 1, 
                      mb: 2,
                      display: task.description ? 'block' : 'none',
                    }}
                  >
                    {task.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip
                      size="small"
                      icon={<CalendarIcon fontSize="small" />}
                      label={isToday ? 'Сегодня' : formatDate(task.deadline)}
                      sx={{
                        bgcolor: 'transparent',
                        border: '1px solid rgba(0, 0, 0, 0.12)',
                        color: isPastDue ? 'var(--error)' : 'var(--text-secondary)',
                        '& .MuiChip-icon': {
                          color: isPastDue ? 'var(--error)' : 'var(--text-secondary)',
                        },
                      }}
                    />
                    
                    {task.subject && (
                      <Chip
                        size="small"
                        label={task.subject}
                        sx={{
                          bgcolor: 'rgba(66, 133, 244, 0.1)',
                          color: 'var(--primary)',
                        }}
                      />
                    )}
                    
                    <Chip
                      size="small"
                      label={
                        task.priority === 'high' ? 'Высокий' :
                        task.priority === 'medium' ? 'Средний' : 'Низкий'
                      }
                      sx={{
                        bgcolor: 
                          task.priority === 'high' ? 'rgba(234, 67, 53, 0.1)' :
                          task.priority === 'medium' ? 'rgba(251, 188, 4, 0.1)' :
                          'rgba(52, 168, 83, 0.1)',
                        color:
                          task.priority === 'high' ? '#EA4335' :
                          task.priority === 'medium' ? '#FBBC04' :
                          '#34A853'
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </List>
  );
};

export default TasksPage;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getTaskColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return '#e53935';
    case 'medium':
      return '#fb8c00';
    case 'low':
      return '#43a047';
    default:
      return '#757575';
  }
};
