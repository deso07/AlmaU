import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  Chip,
  Divider,
  Menu
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Description as DocumentIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  InsertDriveFile as FileIcon,
  GetApp as DownloadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  FilterList as FilterIcon,
  SortByAlpha as SortIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Типы для материалов
interface Material {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'image' | 'video' | 'other';
  subject: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  url: string;
  tags: string[];
  description?: string;
}

// Список предметов
const subjects = [
  'Математика',
  'Информатика',
  'Физика',
  'История',
  'Иностранный язык',
  'Экономика',
  'Право',
  'Философия'
];

// Пустой массив для материалов вместо моковых данных
const mockMaterials: Material[] = [];

// Иконка для типа файла
const getFileIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <PdfIcon color="error" fontSize="large" />;
    case 'doc':
      return <DocumentIcon color="primary" fontSize="large" />;
    case 'image':
      return <ImageIcon color="success" fontSize="large" />;
    case 'video':
      return <VideoIcon color="secondary" fontSize="large" />;
    default:
      return <FileIcon fontSize="large" />;
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

const MaterialsPage: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('date');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  
  // Новый материал
  const [newMaterial, setNewMaterial] = useState<Omit<Material, 'id' | 'url'>>({
    title: '',
    type: 'pdf',
    subject: '',
    uploadedBy: 'Вы',
    uploadDate: new Date().toISOString().split('T')[0],
    size: '0',
    tags: []
  });
  
  // Временное хранение тегов
  const [tagInput, setTagInput] = useState('');
  
  // Обработчики
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };
  
  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
  };
  
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, material: Material) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMaterial(material);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };
  
  const handleOpenDetails = () => {
    setDetailsDialog(true);
    handleMenuClose();
  };
  
  const handleCloseDetails = () => {
    setDetailsDialog(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setNewMaterial(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setNewMaterial(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setNewMaterial(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  
  const handleUpload = () => {
    // В реальном приложении здесь была бы загрузка файла
    const newId = (materials.length + 1).toString();
    const uploaded: Material = {
      ...newMaterial,
      id: newId,
      url: '#'
    };
    
    setMaterials([uploaded, ...materials]);
    handleCloseUploadDialog();
  };
  
  const handleDeleteMaterial = () => {
    if (selectedMaterial) {
      setMaterials(materials.filter(material => material.id !== selectedMaterial.id));
    }
    handleMenuClose();
  };
  
  // Фильтрация материалов
  const filteredMaterials = materials
    .filter(material => {
      // Поиск
      const matchesSearch = searchTerm === '' || 
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Фильтр по предмету
      const matchesSubject = filterSubject === '' || material.subject === filterSubject;
      
      // Фильтр по типу (вкладки)
      const matchesType = tabValue === 0 || 
        (tabValue === 1 && material.type === 'pdf') ||
        (tabValue === 2 && material.type === 'doc') ||
        (tabValue === 3 && material.type === 'video') ||
        (tabValue === 4 && material.type === 'image') ||
        (tabValue === 5 && material.type === 'other');
      
      return matchesSearch && matchesSubject && matchesType;
    });
  
  // Сортировка материалов
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    switch (sortOption) {
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'size':
        return parseFloat(a.size) - parseFloat(b.size);
      default:
        return 0;
    }
  });
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Учебные материалы
        </Typography>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={handleOpenUploadDialog}
        >
          Загрузить
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
            placeholder="Поиск материалов..."
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
          
          <Box sx={{ display: 'flex', gap: 2, minWidth: { xs: '100%', md: '40%' } }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150, flexGrow: 1 }}>
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
            
            <FormControl variant="outlined" size="small" sx={{ minWidth: 150, flexGrow: 1 }}>
              <InputLabel>Сортировка</InputLabel>
              <Select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as string)}
                label="Сортировка"
                startAdornment={<SortIcon fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="date">По дате (новые)</MenuItem>
                <MenuItem value="name">По названию</MenuItem>
                <MenuItem value="size">По размеру</MenuItem>
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
          <Tab label="Все файлы" />
          <Tab label="PDF" icon={<PdfIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Документы" icon={<DocumentIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Видео" icon={<VideoIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Изображения" icon={<ImageIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Другое" icon={<FileIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {sortedMaterials.length === 0 ? (
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
          <Typography color="textSecondary" sx={{ mb: 2 }}>
            Материалы не найдены
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={handleOpenUploadDialog}
          >
            Загрузить материалы
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {sortedMaterials.map(material => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={material.id}>
              <Paper
                elevation={0}
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 140,
                  bgcolor: 'rgba(0, 0, 0, 0.04)',
                  p: 2
                }}>
                  {getFileIcon(material.type)}
                </Box>
                
                <Box sx={{ p: 2, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight="medium" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {material.title}
                    </Typography>
                    <IconButton 
                      size="small"
                      onClick={(e) => handleMenuClick(e, material)}
                    >
                      <MoreIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    {material.subject}
                  </Typography>
                  
                  <Box sx={{ mt: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {material.tags.slice(0, 2).map((tag, index) => (
                      <Chip 
                        key={index} 
                        label={tag} 
                        size="small" 
                        sx={{ 
                          backgroundColor: 'rgba(66, 133, 244, 0.1)',
                          color: 'var(--primary)'
                        }}
                      />
                    ))}
                    {material.tags.length > 2 && (
                      <Chip 
                        label={`+${material.tags.length - 2}`} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: 'rgba(66, 133, 244, 0.3)',
                          color: 'var(--primary)'
                        }}
                      />
                    )}
                  </Box>
                </Box>
                
                <Divider />
                
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="textSecondary">
                    {formatDate(material.uploadDate)}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Скачать">
                      <IconButton size="small">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Поделиться">
                      <IconButton size="small">
                        <ShareIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Меню для материала */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleOpenDetails}>
          <ListItemIcon>
            <DocumentIcon fontSize="small" />
          </ListItemIcon>
          Подробности
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          Скачать
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          Поделиться
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteMaterial} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Удалить
        </MenuItem>
      </Menu>
      
      {/* Диалог загрузки нового материала */}
      <Dialog
        open={openUploadDialog}
        onClose={handleCloseUploadDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Загрузить учебный материал</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField
              margin="dense"
              name="title"
              label="Название материала"
              fullWidth
              variant="outlined"
              value={newMaterial.title}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="dense"
              name="description"
              label="Описание (опционально)"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={newMaterial.description || ''}
              onChange={handleInputChange}
              sx={{ mb: 2 }}
            />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Тип файла</InputLabel>
                  <Select
                    name="type"
                    value={newMaterial.type}
                    onChange={handleSelectChange}
                    label="Тип файла"
                  >
                    <MenuItem value="pdf">PDF</MenuItem>
                    <MenuItem value="doc">Документ Word</MenuItem>
                    <MenuItem value="image">Изображение</MenuItem>
                    <MenuItem value="video">Видео</MenuItem>
                    <MenuItem value="other">Другое</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Предмет</InputLabel>
                  <Select
                    name="subject"
                    value={newMaterial.subject}
                    onChange={handleSelectChange}
                    label="Предмет"
                  >
                    {subjects.map(subject => (
                      <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Теги
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {newMaterial.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                    size="small"
                    sx={{ 
                      backgroundColor: 'rgba(66, 133, 244, 0.1)',
                      color: 'var(--primary)'
                    }}
                  />
                ))}
              </Box>
              
              <TextField
                placeholder="Добавьте теги через Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleAddTag}
                fullWidth
                variant="outlined"
                size="small"
                helperText="Добавьте ключевые слова для облегчения поиска"
              />
            </Box>
            
            <Box sx={{ mt: 2, p: 2, border: '2px dashed rgba(0, 0, 0, 0.12)', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Перетащите файл сюда или нажмите для выбора
              </Typography>
              <Button
                variant="outlined"
                component="label"
                sx={{ mt: 1 }}
              >
                Выбрать файл
                <input
                  type="file"
                  hidden
                />
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} color="inherit">
            Отмена
          </Button>
          <Button 
            onClick={handleUpload}
            variant="contained"
            color="primary"
            disabled={!newMaterial.title || !newMaterial.subject}
          >
            Загрузить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог с деталями материала */}
      <Dialog
        open={detailsDialog}
        onClose={handleCloseDetails}
        maxWidth="sm"
        fullWidth
      >
        {selectedMaterial && (
          <>
            <DialogTitle>
              <Typography variant="h6">{selectedMaterial.title}</Typography>
              <IconButton
                aria-label="close"
                onClick={handleCloseDetails}
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
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {getFileIcon(selectedMaterial.type)}
                </Grid>
                <Grid item xs={12} sm={8}>
                  <List dense disablePadding>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Предмет" 
                        secondary={selectedMaterial.subject} 
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Загружено" 
                        secondary={`${formatDate(selectedMaterial.uploadDate)} • ${selectedMaterial.uploadedBy}`} 
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Размер" 
                        secondary={selectedMaterial.size} 
                      />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemText 
                        primary="Тип файла" 
                        secondary={
                          selectedMaterial.type === 'pdf' ? 'PDF документ' :
                          selectedMaterial.type === 'doc' ? 'Документ Word' :
                          selectedMaterial.type === 'image' ? 'Изображение' :
                          selectedMaterial.type === 'video' ? 'Видео' : 'Другой формат'
                        } 
                      />
                    </ListItem>
                  </List>
                </Grid>
                
                {selectedMaterial.description && (
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Описание
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedMaterial.description}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Теги
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedMaterial.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{ 
                          backgroundColor: 'rgba(66, 133, 244, 0.1)',
                          color: 'var(--primary)'
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button
                startIcon={<ShareIcon />}
                onClick={handleCloseDetails}
              >
                Поделиться
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleCloseDetails}
                color="primary"
              >
                Скачать
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MaterialsPage;
