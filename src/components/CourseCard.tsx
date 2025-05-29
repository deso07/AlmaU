import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PlayCircleOutline,
  Slideshow,
  Assignment,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { Course } from '../types/course';
import { useAuthStore } from '../store/authStore';

interface CourseCardProps {
  course: Course;
  onPurchase: (courseId: string) => void;
  onFavorite: (courseId: string) => void;
  isFavorite?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onPurchase,
  onFavorite,
  isFavorite = false
}) => {
  const { user } = useAuthStore();
  const hasSubscription = user?.role === 'student'; // Предполагаем, что студенты имеют подписку

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <PlayCircleOutline fontSize="small" />;
      case 'presentation':
        return <Slideshow fontSize="small" />;
      case 'task':
        return <Assignment fontSize="small" />;
      default:
        return <PlayCircleOutline fontSize="small" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={course.thumbnail}
        alt={course.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            {course.title}
          </Typography>
          <IconButton onClick={() => onFavorite(course.id)} size="small">
            {isFavorite ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {course.description}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            label={course.level}
            color={getLevelColor(course.level) as any}
            size="small"
          />
          <Chip
            label={course.duration}
            variant="outlined"
            size="small"
          />
        </Stack>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Материалы курса:
          </Typography>
          <Stack direction="row" spacing={1}>
            {course.materials.map((material) => (
              <Tooltip key={material.id} title={material.title}>
                <Chip
                  icon={getMaterialIcon(material.type)}
                  label={material.type}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            ))}
          </Stack>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={course.rating} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({course.reviewsCount})
          </Typography>
        </Box>

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Преподаватель: {course.instructor}
        </Typography>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            {hasSubscription && course.discountPrice ? (
              <>
                <Typography
                  variant="h6"
                  color="primary"
                  component="span"
                  sx={{ mr: 1 }}
                >
                  {course.discountPrice} KZT
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  component="span"
                  sx={{ textDecoration: 'line-through' }}
                >
                  {course.price} KZT
                </Typography>
              </>
            ) : (
              <Typography variant="h6" color="primary">
                {course.price} KZT
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onPurchase(course.id)}
            disabled={course.isPurchased}
          >
            {course.isPurchased ? 'Куплено' : 'Купить'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard; 