import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Menu,
  LinearProgress,
  CircularProgress
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
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { app } from '../config/firebase';
import useMediaQuery from '@mui/material/useMediaQuery';

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
  const navigate = useNavigate();
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('date');
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  
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
  
  // Добавленные поля для загрузки файла
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const storage = getStorage(app);
  const db = getFirestore(app);
  
  const isMobile = useMediaQuery('(max-width:600px)');
  
  // Загрузка материалов из Firestore
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        const materialsRef = collection(db, 'materials');
        const q = query(materialsRef, orderBy('uploadDate', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const materialsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Material[];
        
        setMaterials(materialsData);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [db]);
  
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
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
      // Update material type based on file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      let type: Material['type'] = 'other';
      
      if (extension === 'pdf') type = 'pdf';
      else if (['doc', 'docx'].includes(extension || '')) type = 'doc';
      else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) type = 'image';
      else if (['mp4', 'avi', 'mov', 'wmv'].includes(extension || '')) type = 'video';
      
      setNewMaterial(prev => ({ ...prev, type }));
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Пожалуйста, выберите файл для загрузки');
      return;
    }

    try {
      setUploadProgress(0);
      const storageRef = ref(storage, `materials/${Date.now()}_${selectedFile.name}`);
      
      // Upload file
      const uploadTask = uploadBytes(storageRef, selectedFile);
      await uploadTask;
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Create new material in Firestore
      const materialData = {
        ...newMaterial,
        url: downloadURL,
        size: formatFileSize(selectedFile.size),
        uploadDate: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'materials'), materialData);
      
      // Update local state
      const uploaded: Material = {
        ...materialData,
        id: docRef.id
      };
      
      setMaterials([uploaded, ...materials]);
      handleCloseUploadDialog();
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('Ошибка при загрузке файла. Пожалуйста, попробуйте снова.');
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const handleDeleteMaterial = async () => {
    if (selectedMaterial) {
      try {
        // Delete from Firestore
        await deleteDoc(doc(db, 'materials', selectedMaterial.id));
        
        // Delete file from Storage if needed
        if (selectedMaterial.url) {
          const fileRef = ref(storage, selectedMaterial.url);
          await deleteObject(fileRef);
        }
        
        // Update local state
        setMaterials(materials.filter(material => material.id !== selectedMaterial.id));
      } catch (error) {
        console.error('Error deleting material:', error);
      }
    }
    handleMenuClose();
  };
  
  // Функция для копирования ссылки
  const handleShare = (url: string) => {
    navigator.clipboard.writeText(url);
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
      <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: isMobile ? 'flex-start' : 'space-between', alignItems: isMobile ? 'stretch' : 'center', mb: 3, gap: isMobile ? 2 : 0 }}>
        <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: isMobile ? 1 : 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mb: isMobile ? 1 : 0, width: isMobile ? '100%' : 'auto', fontSize: isMobile ? 16 : 'inherit', py: isMobile ? 1.2 : undefined }}
          >
            Назад
          </Button>
          <Typography
            variant={isMobile ? 'h5' : 'h4'}
            component="h1"
            sx={{ fontWeight: 'bold', wordBreak: 'break-word', fontSize: isMobile ? 22 : undefined, lineHeight: 1.2 }}
          >
            Учебные материалы
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpenUploadDialog}
          sx={{
            width: isMobile ? '100%' : 'auto',
            fontSize: isMobile ? 17 : 'inherit',
            py: isMobile ? 1.3 : undefined,
            px: isMobile ? 0 : 3,
            borderRadius: 2,
            mt: isMobile ? 1 : 0
          }}
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
          sx={{ mb: 2 }}
        >
          <Tab label="Все файлы" />
          <Tab label="PDF" icon={<PdfIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Документы" icon={<DocumentIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Видео" icon={<VideoIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Изображения" icon={<ImageIcon fontSize="small" />} iconPosition="start" />
          <Tab label="Другое" icon={<FileIcon fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Paper>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : sortedMaterials.length === 0 ? (
        <Paper 
          elevation={0} 
          sx={{ 
            p: isMobile ? 2 : 4, 
            textAlign: 'center', 
            borderRadius: 2,
            bgcolor: 'var(--surface)',
            border: '1px solid rgba(0, 0, 0, 0.12)'
          }}
        >
          <Typography color="textSecondary" sx={{ mb: 2, fontSize: isMobile ? 16 : undefined }}>
            Материалы не найдены
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<AddIcon />}
            onClick={handleOpenUploadDialog}
            sx={{
              width: isMobile ? '100%' : 'auto',
              fontSize: isMobile ? 16 : 'inherit',
              py: isMobile ? 1.2 : undefined,
              borderRadius: 2
            }}
          >
            Загрузить материалы
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
          {sortedMaterials.map(material => (
            <Grid item xs={12} md={6} sx={{ width: '100%' }} key={material.id}>
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
                      <IconButton size="small" component="a" href={material.url} target="_blank" rel="noopener noreferrer">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Поделиться (копировать ссылку)">
                      <IconButton size="small" onClick={() => handleShare(material.url)}>
                        <ContentCopyIcon fontSize="small" />
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
                <TextField
                  margin="dense"
                  name="subject"
                  label="Предмет"
                  fullWidth
                  variant="outlined"
                  value={newMaterial.subject}
                  onChange={handleInputChange}
                  required
                />
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
              {selectedFile ? (
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Выбран файл: {selectedFile.name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Размер: {formatFileSize(selectedFile.size)}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedFile(null)}
                    sx={{ mt: 1 }}
                  >
                    Удалить
                  </Button>
                </Box>
              ) : (
                <>
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
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv"
                    />
                  </Button>
                </>
              )}
            </Box>

            {uploadError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {uploadError}
              </Typography>
            )}

            {uploadProgress > 0 && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                  Загрузка: {uploadProgress}%
                </Typography>
              </Box>
            )}
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
            disabled={!newMaterial.title || !newMaterial.subject || !selectedFile}
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
                startIcon={<ContentCopyIcon />}
                onClick={() => handleShare(selectedMaterial.url)}
              >
                Копировать ссылку
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                component="a"
                href={selectedMaterial.url}
                target="_blank"
                rel="noopener noreferrer"
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
