import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  CardMedia,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  FilterList as FilterIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  WorkOutline as WorkIcon,
  Payments as PaymentsIcon,
  School as SchoolIcon,
  AccessTime as TimeIcon,
  Close as CloseIcon,
  Share as ShareIcon,
  Send as SendIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Типы данных
interface JobListing {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'remote' | 'freelance';
  salary?: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  datePosted: string;
  deadline?: string;
  contactEmail?: string;
  contactPhone?: string;
  isBookmarked: boolean;
  tags: string[];
  views: number;
  applicants: number;
  isHot?: boolean;
  isNew?: boolean;
}

// Пустой массив вакансий
const mockJobs: JobListing[] = [];

// Получение типа цвета для типа работы
const getJobTypeColor = (type: string) => {
  switch (type) {
    case 'full-time':
      return { main: '#4285F4', light: 'rgba(66, 133, 244, 0.1)' };
    case 'part-time':
      return { main: '#34A853', light: 'rgba(52, 168, 83, 0.1)' };
    case 'internship':
      return { main: '#FBBC04', light: 'rgba(251, 188, 4, 0.1)' };
    case 'remote':
      return { main: '#9C27B0', light: 'rgba(156, 39, 176, 0.1)' };
    case 'freelance':
      return { main: '#EA4335', light: 'rgba(234, 67, 53, 0.1)' };
    default:
      return { main: '#9E9E9E', light: 'rgba(158, 158, 158, 0.1)' };
  }
};

// Получение названия типа работы
const getJobTypeName = (type: string) => {
  switch (type) {
    case 'full-time':
      return 'Полная занятость';
    case 'part-time':
      return 'Частичная занятость';
    case 'internship':
      return 'Стажировка';
    case 'remote':
      return 'Удаленная работа';
    case 'freelance':
      return 'Фриланс';
    default:
      return type;
  }
};

// Форматирование даты
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const JobBoard: React.FC = () => {
  const [jobs, setJobs] = useState<JobListing[]>(mockJobs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [jobDialogOpen, setJobDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [createJobDialogOpen, setCreateJobDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState<Partial<JobListing>>({
    title: '',
    company: '',
    location: '',
    type: 'internship',
    description: '',
    requirements: [''],
    responsibilities: [''],
    tags: [],
    isBookmarked: false,
    views: 0,
    applicants: 0
  });
  
  // Фильтрация вакансий
  const filteredJobs = jobs.filter(job => {
    // Поиск по тексту
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Фильтр по типу
    const matchesType = selectedType === '' || job.type === selectedType;
    
    // Фильтр по вкладке (сохраненные)
    const matchesSaved = tabValue === 0 || (tabValue === 1 && job.isBookmarked);
    
    return matchesSearch && matchesType && matchesSaved;
  });
  
  const handleOpenJobDetails = (job: JobListing) => {
    setSelectedJob(job);
    setJobDialogOpen(true);
  };
  
  const handleCloseJobDetails = () => {
    setJobDialogOpen(false);
  };
  
  const handleBookmarkToggle = (id: string) => {
    setJobs(jobs.map(job => 
      job.id === id ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenCreateJob = () => {
    setCreateJobDialogOpen(true);
  };
  
  const handleCloseCreateJob = () => {
    setCreateJobDialogOpen(false);
  };
  
  const handleCreateJob = () => {
    // Validate form
    if (!newJob.title || !newJob.company || !newJob.location || !newJob.description) {
      return;
    }
    
    const job: JobListing = {
      id: `job_${Date.now()}`,
      title: newJob.title || '',
      company: newJob.company || '',
      companyLogo: '',
      location: newJob.location || '',
      type: newJob.type as 'full-time' | 'part-time' | 'internship' | 'remote' | 'freelance',
      salary: newJob.salary,
      description: newJob.description || '',
      requirements: newJob.requirements || [''],
      responsibilities: newJob.responsibilities || [''],
      benefits: newJob.benefits || [],
      datePosted: new Date().toISOString().split('T')[0],
      contactEmail: newJob.contactEmail,
      contactPhone: newJob.contactPhone,
      isBookmarked: false,
      tags: newJob.tags || [],
      views: 0,
      applicants: 0,
      isNew: true
    };
    
    setJobs([job, ...jobs]);
    setCreateJobDialogOpen(false);
    
    // Reset form
    setNewJob({
      title: '',
      company: '',
      location: '',
      type: 'internship',
      description: '',
      requirements: [''],
      responsibilities: [''],
      tags: [],
      isBookmarked: false,
      views: 0,
      applicants: 0
    });
  };
  
  const handleNewJobInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNewJobSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNewJob(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddRequirement = () => {
    setNewJob(prev => ({
      ...prev,
      requirements: [...(prev.requirements || []), '']
    }));
  };
  
  const handleRemoveRequirement = (index: number) => {
    setNewJob(prev => ({
      ...prev,
      requirements: (prev.requirements || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleUpdateRequirement = (index: number, value: string) => {
    setNewJob(prev => {
      const newRequirements = [...(prev.requirements || [])];
      newRequirements[index] = value;
      return { ...prev, requirements: newRequirements };
    });
  };
  
  const handleAddResponsibility = () => {
    setNewJob(prev => ({
      ...prev,
      responsibilities: [...(prev.responsibilities || []), '']
    }));
  };
  
  const handleRemoveResponsibility = (index: number) => {
    setNewJob(prev => ({
      ...prev,
      responsibilities: (prev.responsibilities || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleUpdateResponsibility = (index: number, value: string) => {
    setNewJob(prev => {
      const newResponsibilities = [...(prev.responsibilities || [])];
      newResponsibilities[index] = value;
      return { ...prev, responsibilities: newResponsibilities };
    });
  };
  
  const handleAddTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && (event.target as HTMLInputElement).value.trim()) {
      const newTag = (event.target as HTMLInputElement).value.trim();
      setNewJob(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag]
      }));
      (event.target as HTMLInputElement).value = '';
    }
  };
  
  const handleRemoveTag = (tag: string) => {
    setNewJob(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Вакансии и стажировки
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenCreateJob}
        >
          Разместить вакансию
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
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          <TextField
            placeholder="Поиск вакансий..."
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
          
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Тип занятости</InputLabel>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as string)}
              label="Тип занятости"
              startAdornment={<FilterIcon fontSize="small" sx={{ mr: 1 }} />}
            >
              <MenuItem value="">Все типы</MenuItem>
              <MenuItem value="full-time">Полная занятость</MenuItem>
              <MenuItem value="part-time">Частичная занятость</MenuItem>
              <MenuItem value="internship">Стажировка</MenuItem>
              <MenuItem value="remote">Удаленная работа</MenuItem>
              <MenuItem value="freelance">Фриланс</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ mt: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Все вакансии" />
          <Tab label="Сохраненные" />
        </Tabs>
      </Paper>
      
      {filteredJobs.length > 0 ? (
        <Grid container spacing={3}>
          {filteredJobs.map((job) => (
            <Grid item xs={12} sm={6} md={4} key={job.id}>
              <Card 
                elevation={0}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      src={job.companyLogo} 
                      alt={job.company}
                      sx={{ width: 48, height: 48, mr: 2 }}
                    >
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                        {job.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {job.company}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <IconButton 
                      size="small"
                      onClick={() => handleBookmarkToggle(job.id)}
                      sx={{ color: job.isBookmarked ? 'primary.main' : 'text.disabled' }}
                    >
                      {job.isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                    </IconButton>
                  </Box>
                </Box>
                
                <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <LocationIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="textSecondary">
                      {job.location}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      size="small" 
                      label={getJobTypeName(job.type)}
                      sx={{ 
                        bgcolor: getJobTypeColor(job.type).light, 
                        color: getJobTypeColor(job.type).main,
                        mr: 1
                      }}
                    />
                    
                    {job.isNew && (
                      <Chip 
                        size="small" 
                        label="Новая" 
                        sx={{ bgcolor: 'rgba(66, 133, 244, 0.1)', color: '#4285F4' }}
                      />
                    )}
                    
                    {job.isHot && (
                      <Chip 
                        size="small" 
                        label="Горячая" 
                        sx={{ bgcolor: 'rgba(234, 67, 53, 0.1)', color: '#EA4335' }}
                      />
                    )}
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2, height: 60, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                    {job.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {job.tags.slice(0, 3).map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}
                      />
                    ))}
                    {job.tags.length > 3 && (
                      <Chip 
                        label={`+${job.tags.length - 3}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ bgcolor: 'transparent' }}
                      />
                    )}
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      {formatDate(job.datePosted)}
                    </Typography>
                  </Box>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={() => handleOpenJobDetails(job)}
                  >
                    Подробнее
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
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
            Вакансии не найдены
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Попробуйте изменить параметры поиска или разместите свою вакансию
          </Typography>
          <Button 
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={handleOpenCreateJob}
          >
            Разместить вакансию
          </Button>
        </Paper>
      )}
      
      {/* Диалог с подробной информацией о вакансии */}
      <Dialog 
        open={jobDialogOpen} 
        onClose={handleCloseJobDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'var(--surface)'
          }
        }}
      >
        {selectedJob && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" component="div">
                  {selectedJob.title}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 0.5 }}>
                  {selectedJob.company}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseJobDetails} size="large">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Описание вакансии
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {selectedJob.description}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>
                      Требования
                    </Typography>
                    <List disablePadding>
                      {selectedJob.requirements.map((requirement, index) => (
                        <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <Box 
                              component="span" 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: 'primary.main', 
                                display: 'inline-block' 
                              }} 
                            />
                          </ListItemIcon>
                          <ListItemText primary={requirement} />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Обязанности
                    </Typography>
                    <List disablePadding>
                      {selectedJob.responsibilities.map((responsibility, index) => (
                        <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 24 }}>
                            <Box 
                              component="span" 
                              sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: 'secondary.main', 
                                display: 'inline-block' 
                              }} 
                            />
                          </ListItemIcon>
                          <ListItemText primary={responsibility} />
                        </ListItem>
                      ))}
                    </List>
                    
                    {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                      <>
                        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                          Мы предлагаем
                        </Typography>
                        <List disablePadding>
                          {selectedJob.benefits.map((benefit, index) => (
                            <ListItem key={index} sx={{ pl: 0, py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 24 }}>
                                <Box 
                                  component="span" 
                                  sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    bgcolor: '#34A853', 
                                    display: 'inline-block' 
                                  }} 
                                />
                              </ListItemIcon>
                              <ListItemText primary={benefit} />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    )}
                    
                    <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selectedJob.tags.map((tag, index) => (
                        <Chip 
                          key={index} 
                          label={tag} 
                          size="small" 
                          sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}
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
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      mb: 3
                    }}
                  >
                    <List disablePadding>
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <BusinessIcon color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Компания" 
                          secondary={selectedJob.company} 
                        />
                      </ListItem>
                      
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <LocationIcon color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Местоположение" 
                          secondary={selectedJob.location} 
                        />
                      </ListItem>
                      
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <WorkIcon color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Тип занятости" 
                          secondary={getJobTypeName(selectedJob.type)} 
                        />
                      </ListItem>
                      
                      {selectedJob.salary && (
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <PaymentsIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Зарплата" 
                            secondary={selectedJob.salary} 
                          />
                        </ListItem>
                      )}
                      
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <SchoolIcon color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Подходит студентам" 
                          secondary="Да" 
                        />
                      </ListItem>
                      
                      <ListItem disableGutters>
                        <ListItemIcon>
                          <TimeIcon color="action" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Опубликовано" 
                          secondary={formatDate(selectedJob.datePosted)} 
                        />
                      </ListItem>
                      
                      {selectedJob.deadline && (
                        <ListItem disableGutters>
                          <ListItemIcon>
                            <TimeIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Срок подачи" 
                            secondary={formatDate(selectedJob.deadline)} 
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>
                  
                  {(selectedJob.contactEmail || selectedJob.contactPhone) && (
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        bgcolor: 'rgba(0, 0, 0, 0.02)',
                        border: '1px solid rgba(0, 0, 0, 0.08)'
                      }}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        Контактная информация
                      </Typography>
                      
                      {selectedJob.contactEmail && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          Email: {selectedJob.contactEmail}
                        </Typography>
                      )}
                      
                      {selectedJob.contactPhone && (
                        <Typography variant="body2">
                          Телефон: {selectedJob.contactPhone}
                        </Typography>
                      )}
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button 
                startIcon={<ShareIcon />}
                onClick={handleCloseJobDetails}
              >
                Поделиться
              </Button>
              <Button
                startIcon={<BookmarkIcon />}
                onClick={() => handleBookmarkToggle(selectedJob.id)}
                color={selectedJob.isBookmarked ? 'primary' : 'inherit'}
              >
                {selectedJob.isBookmarked ? 'Сохранено' : 'Сохранить'}
              </Button>
              <Button 
                variant="contained"
                startIcon={<SendIcon />}
                color="primary"
              >
                Откликнуться
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Диалог создания новой вакансии */}
      <Dialog
        open={createJobDialogOpen}
        onClose={handleCloseCreateJob}
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
          Создать вакансию
          <IconButton 
            onClick={handleCloseCreateJob}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <TextField
                name="title"
                label="Название вакансии"
                placeholder="Введите название должности"
                fullWidth
                value={newJob.title || ''}
                onChange={handleNewJobInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="company"
                label="Название компании"
                placeholder="Введите название организации"
                fullWidth
                value={newJob.company || ''}
                onChange={handleNewJobInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="location"
                label="Местоположение"
                placeholder="Город или формат работы"
                fullWidth
                value={newJob.location || ''}
                onChange={handleNewJobInputChange}
                required
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Тип занятости</InputLabel>
                <Select
                  name="type"
                  value={newJob.type || 'internship'}
                  onChange={handleNewJobSelectChange}
                  label="Тип занятости"
                >
                  <MenuItem value="full-time">Полная занятость</MenuItem>
                  <MenuItem value="part-time">Частичная занятость</MenuItem>
                  <MenuItem value="internship">Стажировка</MenuItem>
                  <MenuItem value="remote">Удаленная работа</MenuItem>
                  <MenuItem value="freelance">Фриланс</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="salary"
                label="Зарплата (опционально)"
                placeholder="Например: 50 000 - 70 000 ₽"
                fullWidth
                value={newJob.salary || ''}
                onChange={handleNewJobInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="contactEmail"
                label="Контактный email (опционально)"
                placeholder="Введите email для связи"
                fullWidth
                value={newJob.contactEmail || ''}
                onChange={handleNewJobInputChange}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Описание вакансии"
                placeholder="Опишите должность, основные задачи и требуемый опыт"
                fullWidth
                multiline
                rows={4}
                value={newJob.description || ''}
                onChange={handleNewJobInputChange}
                required
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 1 }}>
                Требования
              </Typography>
              
              {newJob.requirements?.map((req, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    value={req}
                    placeholder="Введите требование"
                    onChange={(e) => handleUpdateRequirement(index, e.target.value)}
                    size="small"
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveRequirement(index)}
                    disabled={newJob.requirements?.length === 1}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleAddRequirement}
                sx={{ mt: 1 }}
              >
                Добавить требование
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 1 }}>
                Обязанности
              </Typography>
              
              {newJob.responsibilities?.map((resp, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    value={resp}
                    placeholder="Введите обязанность"
                    onChange={(e) => handleUpdateResponsibility(index, e.target.value)}
                    size="small"
                  />
                  <IconButton 
                    color="error" 
                    onClick={() => handleRemoveResponsibility(index)}
                    disabled={newJob.responsibilities?.length === 1}
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={handleAddResponsibility}
                sx={{ mt: 1 }}
              >
                Добавить обязанность
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 1 }}>
                Теги
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {newJob.tags?.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                  />
                ))}
              </Box>
              
              <TextField
                fullWidth
                placeholder="Введите тег и нажмите Enter (например: JavaScript, Удаленная работа)"
                size="small"
                onKeyPress={handleAddTag}
                helperText="Добавьте ключевые навыки, технологии или особенности работы"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCreateJob} color="inherit">
            Отмена
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleCreateJob}
            disabled={!newJob.title || !newJob.company || !newJob.location || !newJob.description}
          >
            Опубликовать
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default JobBoard;
