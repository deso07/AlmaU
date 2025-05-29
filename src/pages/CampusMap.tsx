import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
  IconButton,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Grid,
  Tabs,
  Tab,
  Drawer,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Restaurant as RestaurantIcon,
  LocalLibrary as LibraryIcon,
  MeetingRoom as RoomIcon,
  DirectionsBus as TransportIcon,
  Apartment as DormIcon,
  SportsTennis as SportIcon,
  LocalHospital as MedicalIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Navigation as NavigationIcon,
  MyLocation as MyLocationIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon
} from '@mui/icons-material';

// Типы данных для мест на карте
interface Place {
  id: string;
  name: string;
  type: 'building' | 'library' | 'cafeteria' | 'dorm' | 'sport' | 'medical' | 'transport' | 'classroom';
  description: string;
  address: string;
  coordinates: { x: number; y: number };
  floor?: number;
  openingHours?: string;
  image?: string;
  amenities?: string[];
}

// Пустой массив мест вместо моковых данных
const mockPlaces: Place[] = [];

// Получение иконки для типа места
const getPlaceIcon = (type: string) => {
  switch (type) {
    case 'building':
      return <SchoolIcon />;
    case 'library':
      return <LibraryIcon />;
    case 'cafeteria':
      return <RestaurantIcon />;
    case 'dorm':
      return <DormIcon />;
    case 'sport':
      return <SportIcon />;
    case 'medical':
      return <MedicalIcon />;
    case 'transport':
      return <TransportIcon />;
    case 'classroom':
      return <RoomIcon />;
    default:
      return <LocationIcon />;
  }
};

// Получение названия типа места
const getPlaceTypeName = (type: string) => {
  switch (type) {
    case 'building':
      return 'Учебный корпус';
    case 'library':
      return 'Библиотека';
    case 'cafeteria':
      return 'Столовая';
    case 'dorm':
      return 'Общежитие';
    case 'sport':
      return 'Спортивный объект';
    case 'medical':
      return 'Медпункт';
    case 'transport':
      return 'Транспорт';
    case 'classroom':
      return 'Аудитория';
    default:
      return 'Место';
  }
};

// Получение цвета для типа места
const getPlaceTypeColor = (type: string) => {
  switch (type) {
    case 'building':
      return { main: '#4285F4', light: 'rgba(66, 133, 244, 0.1)' };
    case 'library':
      return { main: '#34A853', light: 'rgba(52, 168, 83, 0.1)' };
    case 'cafeteria':
      return { main: '#FBBC04', light: 'rgba(251, 188, 4, 0.1)' };
    case 'dorm':
      return { main: '#9C27B0', light: 'rgba(156, 39, 176, 0.1)' };
    case 'sport':
      return { main: '#EA4335', light: 'rgba(234, 67, 53, 0.1)' };
    case 'medical':
      return { main: '#F44336', light: 'rgba(244, 67, 54, 0.1)' };
    case 'transport':
      return { main: '#FF9800', light: 'rgba(255, 152, 0, 0.1)' };
    case 'classroom':
      return { main: '#607D8B', light: 'rgba(96, 125, 139, 0.1)' };
    default:
      return { main: '#9E9E9E', light: 'rgba(158, 158, 158, 0.1)' };
  }
};

const CampusMap: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  
  // Фильтрация мест по поиску и типу
  const filteredPlaces = mockPlaces.filter(place => {
    // Поиск по названию или описанию
    const matchesSearch = searchTerm === '' || 
      place.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      place.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Фильтр по типу
    const matchesType = selectedType === 'all' || place.type === selectedType;
    
    return matchesSearch && matchesType;
  });
  
  const handlePlaceClick = (place: Place) => {
    setSelectedPlace(place);
    setDetailsOpen(true);
  };
  
  const handleCloseDetails = () => {
    setDetailsOpen(false);
  };
  
  const handleZoomIn = () => {
    if (zoomLevel < 150) {
      setZoomLevel(zoomLevel + 10);
    }
  };
  
  const handleZoomOut = () => {
    if (zoomLevel > 50) {
      setZoomLevel(zoomLevel - 10);
    }
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Карта кампуса
        </Typography>
        
        <TextField
          placeholder="Найти место..."
          variant="outlined"
          size="small"
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
          sx={{ width: { xs: '100%', sm: 250 } }}
        />
      </Box>
      
      <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
        {/* Фильтры и список мест */}
        <Grid item xs={12} md={4} lg={3}>
          <Paper 
            elevation={0} 
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              bgcolor: 'var(--surface)',
              mb: 3
            }}
          >
            <Tabs 
              value={selectedType}
              onChange={(e, v) => setSelectedType(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ mb: 2 }}
            >
              <Tab icon={<LocationIcon />} label="Все" />
              <Tab icon={<SchoolIcon />} label="Корпуса" />
              <Tab icon={<LibraryIcon />} label="Библиотеки" />
              <Tab icon={<RestaurantIcon />} label="Столовые" />
              <Tab icon={<DormIcon />} label="Общежития" />
              <Tab icon={<SportIcon />} label="Спорт" />
              <Tab icon={<MedicalIcon />} label="Медпункты" />
              <Tab icon={<TransportIcon />} label="Транспорт" />
              <Tab icon={<RoomIcon />} label="Аудитории" />
            </Tabs>
          </Paper>
          
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              bgcolor: 'var(--surface)',
              height: isMobile ? 'auto' : '60vh',
              overflow: 'auto'
            }}
          >
            <List disablePadding>
              {filteredPlaces.length > 0 ? (
                filteredPlaces.map((place) => {
                  const typeColor = getPlaceTypeColor(place.type);
                  
                  return (
                    <React.Fragment key={place.id}>
                      <ListItem 
                        button 
                        onClick={() => handlePlaceClick(place)}
                        sx={{ py: 2 }}
                      >
                        <ListItemIcon sx={{ color: typeColor.main }}>
                          {getPlaceIcon(place.type)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={place.name} 
                          secondary={
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {place.address}
                            </Typography>
                          } 
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  );
                })
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">
                    Места не найдены
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    Попробуйте изменить параметры поиска или добавьте новые места на карту
                  </Typography>
                  <Button variant="outlined" sx={{ mt: 2 }}>
                    Добавить место
                  </Button>
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
        
        {/* Карта кампуса */}
        <Grid item xs={12} md={8} lg={9}>
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.12)',
              bgcolor: 'var(--surface)',
              height: { xs: '50vh', md: '70vh' },
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {/* Пустая карта без предзаполненных объектов */}
            <Box 
              sx={{ 
                position: 'relative', 
                width: '100%',
                height: '100%',
                backgroundImage: 'url(https://via.placeholder.com/1200x800?text=Campus+Map)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${zoomLevel / 100})`,
                transition: 'transform 0.3s ease'
              }}
            >
              <Box sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                bgcolor: 'rgba(255, 255, 255, 0.8)',
                p: 3,
                borderRadius: 2,
                textAlign: 'center'
              }}>
                <Typography variant="h6" gutterBottom>
                  Карта пуста
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Добавьте места и объекты на карту кампуса
                </Typography>
                <Button variant="contained" sx={{ mt: 2 }}>
                  Начать добавление
                </Button>
              </Box>
            </Box>
            
            {/* Элементы управления картой */}
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                right: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <IconButton 
                onClick={handleZoomIn}
                sx={{ 
                  bgcolor: 'white', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <ZoomInIcon />
              </IconButton>
              <IconButton 
                onClick={handleZoomOut}
                sx={{ 
                  bgcolor: 'white', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <ZoomOutIcon />
              </IconButton>
              <IconButton 
                sx={{ 
                  bgcolor: 'white', 
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  '&:hover': { bgcolor: 'white' }
                }}
              >
                <MyLocationIcon />
              </IconButton>
            </Box>
            
            {/* Легенда карты */}
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 16, 
                left: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 1,
                padding: 1,
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
              }}
            >
              <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                Легенда:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['building', 'library', 'cafeteria', 'dorm', 'classroom'].map(type => {
                  const typeColor = getPlaceTypeColor(type);
                  
                  return (
                    <Chip
                      key={type}
                      size="small"
                      icon={
                        <Box sx={{ color: typeColor.main }}>{getPlaceIcon(type)}</Box>
                      }
                      label={getPlaceTypeName(type)}
                      sx={{ bgcolor: typeColor.light, color: typeColor.main, border: `1px solid ${typeColor.main}` }}
                    />
                  );
                })}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Боковая панель с подробной информацией */}
      <Drawer
        anchor={isMobile ? 'bottom' : 'right'}
        open={detailsOpen}
        onClose={handleCloseDetails}
        PaperProps={{
          sx: {
            width: isMobile ? '100%' : 400,
            borderTopLeftRadius: isMobile ? 16 : 0,
            borderTopRightRadius: isMobile ? 16 : 0,
            maxHeight: isMobile ? '85vh' : '100%',
          }
        }}
      >
        {selectedPlace && (
          <Box sx={{ p: 0 }}>
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height={200}
                image={selectedPlace.image || "https://via.placeholder.com/400x200?text=Place+Image"}
                alt={selectedPlace.name}
              />
              <IconButton
                onClick={handleCloseDetails}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.7)',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
              
              <Box 
                sx={{ 
                  position: 'absolute', 
                  bottom: 0, 
                  left: 0, 
                  right: 0,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  p: 2
                }}
              >
                <Typography variant="h6" color="white">
                  {selectedPlace.name}
                </Typography>
                <Chip
                  size="small"
                  icon={
                    <Box sx={{ color: 'white' }}>{getPlaceIcon(selectedPlace.type)}</Box>
                  }
                  label={getPlaceTypeName(selectedPlace.type)}
                  sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}
                />
              </Box>
            </Box>
            
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1 }} />
                  {selectedPlace.address}
                </Typography>
                
                {selectedPlace.openingHours && (
                  <Typography variant="body2" color="textSecondary">
                    Режим работы: {selectedPlace.openingHours}
                  </Typography>
                )}
              </Box>
              
              <Typography variant="body1" paragraph>
                {selectedPlace.description}
              </Typography>
              
              {selectedPlace.amenities && selectedPlace.amenities.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Доступно:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedPlace.amenities.map((amenity, index) => (
                      <Chip
                        key={index}
                        size="small"
                        label={amenity}
                        sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
            
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
              <Button 
                variant="outlined" 
                startIcon={<InfoIcon />}
                size="small"
              >
                Подробнее
              </Button>
              <Button 
                variant="contained" 
                startIcon={<NavigationIcon />}
                color="primary"
                size="small"
              >
                Проложить маршрут
              </Button>
            </CardActions>
          </Box>
        )}
      </Drawer>
    </Box>
  );
};

export default CampusMap;
