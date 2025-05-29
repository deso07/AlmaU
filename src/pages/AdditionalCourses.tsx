import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Alert,
  Snackbar
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import CourseCard from '../components/CourseCard';
import { Discipline, Course } from '../types/course';

// Временные данные для демонстрации
const mockDisciplines: Discipline[] = [
  {
    id: '1',
    title: 'Программирование',
    description: 'Курсы по различным языкам программирования и технологиям',
    icon: '💻',
    courses: [
      {
        id: '1',
        title: 'Введение в Python',
        description: 'Базовый курс по программированию на Python',
        price: 2999,
        discountPrice: 1499,
        instructor: 'Tim Cook',
        rating: 4.5,
        reviewsCount: 128,
        materials: [
          { 
            id: '1', 
            type: 'video', 
            title: 'Введение в Python', 
            description: 'Базовое введение в язык программирования Python',
            duration: '45 мин', 
            url: '#' 
          },
          { 
            id: '2', 
            type: 'presentation', 
            title: 'Основы Python', 
            description: 'Презентация с основными концепциями Python',
            url: '#' 
          },
          { 
            id: '3', 
            type: 'task', 
            title: 'Практические задания', 
            description: 'Набор практических заданий для закрепления материала',
            url: '#' 
          }
        ],
        thumbnail: 'https://source.unsplash.com/random/300x200?python',
        duration: '12 часов',
        level: 'beginner'
      },
      // Добавьте больше курсов здесь
    ]
  },
  {
    id: '2',
    title: 'Математика',
    description: 'Курсы по высшей математике и статистике',
    icon: '📐',
    courses: [
      {
        id: '2',
        title: 'Линейная алгебра',
        description: 'Основы линейной алгебры для программистов',
        price: 3999,
        discountPrice: 1999,
        instructor: 'Albert Einstein',
        rating: 4.8,
        reviewsCount: 95,
        materials: [
          { 
            id: '1', 
            type: 'video', 
            title: 'Векторы и матрицы', 
            description: 'Видеоурок по основам линейной алгебры',
            duration: '60 мин', 
            url: '#' 
          },
          { 
            id: '2', 
            type: 'presentation', 
            title: 'Системы уравнений', 
            description: 'Презентация по решению систем линейных уравнений',
            url: '#' 
          },
          { 
            id: '3', 
            type: 'task', 
            title: 'Практикум', 
            description: 'Практические задания по линейной алгебре',
            url: '#' 
          }
        ],
        thumbnail: 'https://source.unsplash.com/random/300x200?math',
        duration: '16 часов',
        level: 'intermediate'
      },
      // Добавьте больше курсов здесь
    ]
  }
];

const AdditionalCourses: React.FC = () => {
  const [selectedDiscipline, setSelectedDiscipline] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const handleDisciplineChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedDiscipline(newValue);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handlePurchase = (courseId: string) => {
    // Здесь будет логика покупки курса
    setSnackbar({
      open: true,
      message: 'Курс успешно приобретен!',
      severity: 'success'
    });
  };

  const handleFavorite = (courseId: string) => {
    setFavorites(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      }
      return [...prev, courseId];
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const filteredCourses = mockDisciplines[selectedDiscipline].courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Дополнительные курсы
      </Typography>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Поиск курсов..."
          value={searchQuery}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={selectedDiscipline}
          onChange={handleDisciplineChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {mockDisciplines.map((discipline) => (
            <Tab
              key={discipline.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{discipline.icon}</span>
                  <span>{discipline.title}</span>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard
              course={course}
              onPurchase={handlePurchase}
              onFavorite={handleFavorite}
              isFavorite={favorites.includes(course.id)}
            />
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdditionalCourses; 