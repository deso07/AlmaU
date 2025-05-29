import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button
} from '@mui/material';
import { School as SchoolIcon, Add as AddIcon } from '@mui/icons-material';
import { getFirestore, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { app } from '../config/firebase';
import { useAuthStore } from '../store/authStore';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface Announcement {
  id: string;
  courseId: string;
  text: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

interface Course {
  id: string;
  name: string;
}

const Announcements: React.FC = () => {
  const { user } = useAuthStore();
  const db = getFirestore(app);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filterCourse, setFilterCourse] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [newAnnouncementText, setNewAnnouncementText] = useState('');

  // Загрузка курсов пользователя
  useEffect(() => {
    if (!user?.uid) return;
    const fetchCourses = async () => {
      let courseIds: string[] = [];
      if (user.role === 'teacher' || user.role === 'admin') {
        // Преподаватель: свои курсы
        const q = query(collection(db, 'courses'), where('teacherId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const loadedCourses: Course[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, name: docSnap.data().name }));
        setCourses(loadedCourses);
        courseIds = loadedCourses.map(c => c.id);
      } else {
        // Студент: курсы, в которых состоит
        const q = query(collection(db, 'courseStudents'), where('studentId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        courseIds = querySnapshot.docs.map(docSnap => docSnap.data().courseId);
        // Получаем названия курсов
        const courseDocs = await Promise.all(courseIds.map(cid => getDocs(query(collection(db, 'courses'), where('__name__', '==', cid)))));
        const loadedCourses: Course[] = courseDocs.flatMap(qs => qs.docs.map(docSnap => ({ id: docSnap.id, name: docSnap.data().name })));
        setCourses(loadedCourses);
      }
      // Загрузка объявлений
      if (courseIds.length > 0) {
        const q = query(collection(db, 'announcements'), where('courseId', 'in', courseIds));
        const querySnapshot = await getDocs(q);
        const loadedAnnouncements: Announcement[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Announcement[];
        setAnnouncements(loadedAnnouncements.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } else {
        setAnnouncements([]);
      }
      setLoading(false);
    };
    fetchCourses();
  }, [user, db]);

  // Проверка на новые объявления для студента
  useEffect(() => {
    if (!user || user.role === 'teacher' || user.role === 'admin') return;
    const lastSeenId = localStorage.getItem('lastSeenAnnouncementId');
    if (announcements.length > 0 && announcements[0].id !== lastSeenId) {
      setShowNewAnnouncement(true);
      setNewAnnouncementText(announcements[0].text.slice(0, 60) + (announcements[0].text.length > 60 ? '...' : ''));
    }
  }, [announcements, user]);

  const handleViewAnnouncements = () => {
    if (announcements.length > 0) {
      localStorage.setItem('lastSeenAnnouncementId', announcements[0].id);
    }
    setShowNewAnnouncement(false);
    // Можно добавить скролл к списку объявлений
    const list = document.getElementById('announcements-list');
    if (list) list.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredAnnouncements = filterCourse
    ? announcements.filter(a => a.courseId === filterCourse)
    : announcements;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Объявления</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>Курс</InputLabel>
          <Select
            value={filterCourse}
            label="Курс"
            onChange={e => setFilterCourse(e.target.value)}
          >
            <MenuItem value="">Все курсы</MenuItem>
            {courses.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
          </Select>
        </FormControl>
        {user?.role === 'teacher' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            href="/teacher-courses"
          >
            Отправить объявление
          </Button>
        )}
      </Box>
      <Paper sx={{ p: 2, borderRadius: 2, minHeight: 200 }}>
        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : filteredAnnouncements.length === 0 ? (
          <Typography color="textSecondary">Объявлений нет</Typography>
        ) : (
          <List id="announcements-list">
            {filteredAnnouncements.map(a => {
              const course = courses.find(c => c.id === a.courseId)?.name || 'Курс';
              return (
                <ListItem key={a.id} alignItems="flex-start" sx={{ mb: 2 }}>
                  <ListItemAvatar>
                    <Avatar>
                      <SchoolIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={course} size="small" sx={{ bgcolor: 'rgba(0,0,0,0.05)' }} />
                        <Typography variant="body2" color="textSecondary">
                          {new Date(a.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{a.text}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {a.authorName}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              );
            })}
          </List>
        )}
      </Paper>
      {/* Snackbar для новых объявлений */}
      <Snackbar
        open={showNewAnnouncement}
        autoHideDuration={10000}
        onClose={() => setShowNewAnnouncement(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowNewAnnouncement(false)}
          severity="info"
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleViewAnnouncements}>
              Посмотреть
            </Button>
          }
        >
          Новое объявление: {newAnnouncementText}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Announcements; 