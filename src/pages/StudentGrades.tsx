import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
  Button
} from '@mui/material';
import { getFirestore, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { app } from '../config/firebase';
import { useAuthStore } from '../store/authStore';

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  value: number | null;
  type: string;
  date: string;
  comment?: string;
}

interface Course {
  id: string;
  name: string;
}

const StudentGrades: React.FC = () => {
  const { user } = useAuthStore();
  const db = getFirestore(app);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewGrade, setShowNewGrade] = useState(false);
  const [newGradeText, setNewGradeText] = useState('');

  // Загрузка курсов студента (разово)
  useEffect(() => {
    if (!user?.uid) return;
    const fetchCourses = async () => {
      // Получаем курсы, в которых состоит студент
      const csQ = query(collection(db, 'courseStudents'), where('studentId', '==', user.uid));
      const csSnap = await getDocs(csQ);
      const courseIds = csSnap.docs.map(doc => doc.data().courseId);
      // Получаем названия курсов
      const courseDocs = await Promise.all(courseIds.map(cid => getDocs(query(collection(db, 'courses'), where('__name__', '==', cid)))));
      const loadedCourses: Course[] = courseDocs.flatMap(qs => qs.docs.map(docSnap => ({ id: docSnap.id, name: docSnap.data().name })));
      setCourses(loadedCourses);
    };
    fetchCourses();
  }, [user, db]);

  // Реалтайм-слушатель оценок
  useEffect(() => {
    if (!user?.uid) return;
    let unsubscribe: (() => void) | undefined;
    const listenGrades = async () => {
      // Получаем курсы, в которых состоит студент
      const csQ = query(collection(db, 'courseStudents'), where('studentId', '==', user.uid));
      const csSnap = await getDocs(csQ);
      const courseIds = csSnap.docs.map(doc => doc.data().courseId);
      if (courseIds.length > 0) {
        const gQ = query(collection(db, 'grades'), where('studentId', '==', user.uid), where('courseId', 'in', courseIds));
        unsubscribe = onSnapshot(gQ, (gSnap) => {
          const loadedGrades: Grade[] = gSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Grade[];
          setGrades(loadedGrades.sort((a, b) => b.date.localeCompare(a.date)));
          setLoading(false);
        });
      } else {
        setGrades([]);
        setLoading(false);
      }
    };
    listenGrades();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, db]);

  // Уведомление о новых оценках
  useEffect(() => {
    if (!user) return;
    const lastSeenGradeId = localStorage.getItem('lastSeenGradeId');
    if (grades.length > 0 && grades[0].id !== lastSeenGradeId) {
      setShowNewGrade(true);
      setNewGradeText(`${courses.find(c => c.id === grades[0].courseId)?.name || 'Курс'}: ${grades[0].value}`);
    }
  }, [grades, courses, user]);

  const handleViewGrades = () => {
    if (grades.length > 0) {
      localStorage.setItem('lastSeenGradeId', grades[0].id);
    }
    setShowNewGrade(false);
    // Можно добавить скролл к таблице оценок
    const table = document.getElementById('grades-table');
    if (table) table.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Успеваемость</Typography>
      <Paper sx={{ p: 2, borderRadius: 2, minHeight: 200 }}>
        {loading ? (
          <Typography>Загрузка...</Typography>
        ) : grades.length === 0 ? (
          <Typography color="textSecondary">Оценок нет</Typography>
        ) : (
          <TableContainer>
            <Table id="grades-table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Курс</TableCell>
                  <TableCell>Оценка</TableCell>
                  <TableCell>Тип</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Комментарий</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {grades.map(g => {
                  const course = courses.find(c => c.id === g.courseId)?.name || '';
                  return (
                    <TableRow key={g.id}>
                      <TableCell>{course}</TableCell>
                      <TableCell>
                        <Chip label={g.value} color={g.value && g.value >= 60 ? 'success' : 'error'} />
                      </TableCell>
                      <TableCell>{g.type}</TableCell>
                      <TableCell>{new Date(g.date).toLocaleDateString()}</TableCell>
                      <TableCell>{g.comment}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {/* Snackbar для новых оценок */}
      <Snackbar
        open={showNewGrade}
        autoHideDuration={10000}
        onClose={() => setShowNewGrade(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowNewGrade(false)}
          severity="info"
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={handleViewGrades}>
              Посмотреть
            </Button>
          }
        >
          Новая оценка: {newGradeText}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentGrades; 