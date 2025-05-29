import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  InputAdornment,
  Chip,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
  FormControl,
  Select,
  MenuItem,
  InputLabel
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const FAQ: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'teacher';
  
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: 'faq_1',
      question: 'Как добавить задачу?',
      answer: 'Перейдите в раздел «Задачи» (https://sthub2-da44f.web.app/tasks) и нажмите «Добавить задачу».',
      category: 'academic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_2',
      question: 'Как посмотреть свои оценки?',
      answer: 'Откройте раздел «Оценки» (https://sthub2-da44f.web.app/grades).',
      category: 'academic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_3',
      question: 'Как записаться на дополнительный курс?',
      answer: 'Перейдите в «Дополнительные курсы» (https://sthub2-da44f.web.app/additional-courses) и выберите интересующий курс.',
      category: 'academic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_4',
      question: 'Как связаться с поддержкой?',
      answer: 'Используйте этот чат или перейдите в раздел «FAQ» (https://sthub2-da44f.web.app/faq).',
      category: 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_5',
      question: 'Как загрузить учебный материал?',
      answer: 'В разделе «Материалы» (https://sthub2-da44f.web.app/materials) нажмите «Загрузить материал» и следуйте инструкциям.',
      category: 'academic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_6',
      question: 'Как восстановить пароль?',
      answer: 'На странице входа нажмите «Забыли пароль?» и следуйте подсказкам.',
      category: 'technical',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_7',
      question: 'Как изменить профиль?',
      answer: 'В разделе «Настройки» (https://sthub2-da44f.web.app/settings) вы можете изменить свои данные и настройки безопасности.',
      category: 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_8',
      question: 'Как найти расписание занятий?',
      answer: 'Перейдите в раздел «Расписание» (https://sthub2-da44f.web.app/schedule).',
      category: 'academic',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_9',
      question: 'Как посмотреть карту кампуса?',
      answer: 'Откройте раздел «Карта кампуса» (https://sthub2-da44f.web.app/campus-map).',
      category: 'campus',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_10',
      question: 'Как найти вакансию или стажировку?',
      answer: 'Перейдите в раздел «Вакансии» (https://sthub2-da44f.web.app/jobs).',
      category: 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'faq_11',
      question: 'Как участвовать в мероприятиях?',
      answer: 'Смотрите раздел «События» (https://sthub2-da44f.web.app/events).',
      category: 'general',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [adminMode, setAdminMode] = useState(false);
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt'>>({
    question: '',
    answer: '',
    category: 'general'
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // FAQ categories
  const categories = [
    { id: 'general', name: 'Общие вопросы' },
    { id: 'academic', name: 'Учебный процесс' },
    { id: 'technical', name: 'Технические вопросы' },
    { id: 'campus', name: 'Кампус' },
    { id: 'other', name: 'Разное' }
  ];
  
  // Filter FAQ items
  const filteredFAQItems = faqItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group FAQ items by category
  const groupedFAQItems = filteredFAQItems.reduce((acc, item) => {
    const category = item.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, FAQItem[]>);
  
  // Handlers
  const handleOpenDialog = (item?: FAQItem) => {
    if (item) {
      setEditingItem(item);
      setNewItem({
        question: item.question,
        answer: item.answer,
        category: item.category
      });
    } else {
      setEditingItem(null);
      setNewItem({
        question: '',
        answer: '',
        category: 'general'
      });
    }
    setDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (event: any) => {
    setNewItem(prev => ({ ...prev, category: event.target.value }));
  };
  
  const handleSaveFAQ = () => {
    // Validate input
    if (!newItem.question.trim() || !newItem.answer.trim()) {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, заполните все поля',
        severity: 'error'
      });
      return;
    }
    
    const now = new Date().toISOString();
    
    if (editingItem) {
      // Update existing FAQ item
      setFaqItems(prev => prev.map(item => 
        item.id === editingItem.id ? {
          ...item,
          question: newItem.question,
          answer: newItem.answer,
          category: newItem.category,
          updatedAt: now
        } : item
      ));
      
      setSnackbar({
        open: true,
        message: 'Вопрос успешно обновлен',
        severity: 'success'
      });
    } else {
      // Add new FAQ item
      const newFAQItem: FAQItem = {
        id: `faq_${Date.now()}`,
        question: newItem.question,
        answer: newItem.answer,
        category: newItem.category,
        createdAt: now,
        updatedAt: now
      };
      
      setFaqItems(prev => [newFAQItem, ...prev]);
      
      setSnackbar({
        open: true,
        message: 'Вопрос успешно добавлен',
        severity: 'success'
      });
    }
    
    handleCloseDialog();
  };
  
  const handleDeleteFAQ = (id: string) => {
    setFaqItems(prev => prev.filter(item => item.id !== id));
    
    setSnackbar({
      open: true,
      message: 'Вопрос успешно удален',
      severity: 'success'
    });
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Часто задаваемые вопросы
        </Typography>
        
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={adminMode ? <CloseIcon /> : <AdminIcon />}
              onClick={() => setAdminMode(!adminMode)}
            >
              {adminMode ? 'Выключить режим администратора' : 'Режим администратора'}
            </Button>
            
            {adminMode && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Добавить вопрос
              </Button>
            )}
          </Box>
        )}
      </Box>
      
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          bgcolor: 'var(--surface)',
          border: '1px solid var(--outline)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
          <TextField
            placeholder="Поиск по вопросам и ответам..."
            variant="outlined"
            fullWidth
            size="medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={{ flexGrow: 1 }}
          />
          
          <FormControl variant="outlined" size="medium" sx={{ minWidth: 200 }}>
            <InputLabel>Категория</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as string)}
              label="Категория"
            >
              <MenuItem value="all">Все категории</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>
      
      {filteredFAQItems.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
            bgcolor: 'var(--surface)',
            border: '1px solid var(--outline)'
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Вопросы не найдены
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {searchQuery 
              ? 'Попробуйте изменить параметры поиска или выбрать другую категорию' 
              : 'В данный момент нет вопросов'}
          </Typography>
          {isAdmin && adminMode && (
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              sx={{ mt: 2 }}
              onClick={() => handleOpenDialog()}
            >
              Добавить первый вопрос
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {Object.entries(groupedFAQItems).map(([category, items]) => {
            const categoryInfo = categories.find(c => c.id === category) || { id: category, name: 'Другое' };
            
            return (
              <Box key={category} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {categoryInfo.name}
                  </Typography>
                  <Chip 
                    label={`${items.length} вопр.`} 
                    size="small"
                    sx={{ ml: 1, bgcolor: 'var(--hover-overlay)' }}
                  />
                </Box>
                
                {items.map((item) => (
                  <Accordion 
                    key={item.id} 
                    elevation={0}
                    sx={{ 
                      mb: 2, 
                      border: '1px solid var(--outline)', 
                      borderRadius: '8px !important',
                      '&:before': { display: 'none' },
                      overflow: 'hidden'
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-${item.id}-content`}
                      id={`panel-${item.id}-header`}
                      sx={{ 
                        bgcolor: 'var(--hover-overlay)', 
                        '&:hover': { bgcolor: 'var(--active-overlay)' } 
                      }}
                    >
                      <Typography fontWeight="medium">{item.question}</Typography>
                    </AccordionSummary>
                    
                    <AccordionDetails sx={{ pt: 2 }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-line',
                          mb: adminMode ? 2 : 0 
                        }}
                        component="span"
                      >
                        {item.answer.split(/(https?:\/\/[^\s)]+)/g).map((part, idx) =>
                          /^https?:\/\//.test(part) ? (
                            <a
                              key={idx}
                              href={part}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#1976d2', wordBreak: 'break-all' }}
                            >
                              {part}
                            </a>
                          ) : (
                            part
                          )
                        )}
                      </Typography>
                      
                      {adminMode && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                          <Button 
                            startIcon={<EditIcon />} 
                            size="small"
                            onClick={() => handleOpenDialog(item)}
                          >
                            Редактировать
                          </Button>
                          <Button 
                            startIcon={<DeleteIcon />} 
                            size="small" 
                            color="error"
                            onClick={() => handleDeleteFAQ(item.id)}
                          >
                            Удалить
                          </Button>
                        </Box>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            );
          })}
        </>
      )}
      
      {/* Dialog for adding/editing FAQ */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
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
          {editingItem ? 'Редактировать вопрос' : 'Добавить новый вопрос'}
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              name="question"
              label="Вопрос"
              fullWidth
              variant="outlined"
              value={newItem.question}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              name="answer"
              label="Ответ"
              fullWidth
              multiline
              rows={6}
              variant="outlined"
              value={newItem.answer}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Категория</InputLabel>
              <Select
                name="category"
                value={newItem.category}
                onChange={handleCategoryChange}
                label="Категория"
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveFAQ}
            disabled={!newItem.question.trim() || !newItem.answer.trim()}
          >
            {editingItem ? 'Сохранить изменения' : 'Добавить вопрос'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FAQ;
