import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Chip,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  People as PeopleIcon,
  Grade as GradeIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebase';

interface Course {
  id: string;
  name: string;
  type: 'lecture' | 'seminar' | 'lab' | 'exam' | 'consultation';
  day: number;
  startTime: string;
  endTime: string;
  room: string;
  building: string;
  studentGroups: string[];
}

interface Student {
  id: string;
  name: string;
  email: string;
  group: string;
  avatar?: string;
}

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  value: number;
  type: 'exam' | 'test' | 'homework' | 'retake';
  date: string;
  comment?: string;
}

interface Announcement {
  id: string;
  courseId: string;
  text: string;
  createdAt: string;
  authorId: string;
  authorName: string;
}

const TeacherCourses: React.FC = () => {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'admin' || user?.role === 'teacher';
  const db = getFirestore(app);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id'>>({
    name: '',
    type: 'lecture',
    day: 1,
    startTime: '09:00',
    endTime: '10:30',
    room: '',
    building: '',
    studentGroups: []
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseStudents, setCourseStudents] = useState<Student[]>([]);
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    group: '',
    avatar: ''
  });

  const [gradesDialogOpen, setGradesDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  const [newGrade, setNewGrade] = useState<Omit<Grade, 'id'>>({
    studentId: '',
    courseId: '',
    value: 0,
    type: 'exam',
    date: new Date().toISOString().split('T')[0],
    comment: ''
  });

  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementCourse, setAnnouncementCourse] = useState<Course | null>(null);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  // Загрузка курсов преподавателя
  useEffect(() => {
    if (user?.uid && isTeacher) {
      const fetchCourses = async () => {
        const q = query(collection(db, 'courses'), where('teacherId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const loadedCourses: Course[] = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() })) as Course[];
        setCourses(loadedCourses);
      };
      fetchCourses();
    }
  }, [user, isTeacher, db]);

  // Обработчики диалога
  const handleOpenCourseDialog = () => {
    setEditingCourse(null);
    setNewCourse({
      name: '',
      type: 'lecture',
      day: 1,
      startTime: '09:00',
      endTime: '10:30',
      room: '',
      building: '',
      studentGroups: []
    });
    setCourseDialogOpen(true);
  };

  const handleCloseCourseDialog = () => {
    setCourseDialogOpen(false);
    setEditingCourse(null);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setNewCourse({
      name: course.name,
      type: course.type,
      day: course.day,
      startTime: course.startTime,
      endTime: course.endTime,
      room: course.room,
      building: course.building,
      studentGroups: course.studentGroups
    });
    setCourseDialogOpen(true);
  };

  // Обработчики изменений
  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse({
      ...newCourse,
      [name]: value
    });
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setNewCourse({
      ...newCourse,
      [name.replace('course_', '')]: value
    });
  };

  // Сохранение курса
  const handleSaveCourse = async () => {
    if (!user?.uid) return;

    try {
      const courseData = {
        ...newCourse,
        teacherId: user.uid
      };

      if (editingCourse) {
        // Обновление существующего курса
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...courseData, id: editingCourse.id } : c));
        showSnackbar('Курс успешно обновлен');
      } else {
        // Добавление нового курса
        const docRef = await addDoc(collection(db, 'courses'), courseData);
        setCourses(prev => [...prev, { ...courseData, id: docRef.id }]);
        showSnackbar('Курс успешно добавлен');
      }

      handleCloseCourseDialog();
    } catch (error) {
      showSnackbar('Ошибка при сохранении курса', 'error');
    }
  };

  // Удаление курса
  const handleDeleteCourse = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      setCourses(prev => prev.filter(c => c.id !== id));
      showSnackbar('Курс успешно удален');
    } catch (error) {
      showSnackbar('Ошибка при удалении курса', 'error');
    }
  };

  // Вспомогательные функции
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const getDayName = (day: number) => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return days[day - 1] || '';
  };

  const getCourseTypeName = (type: string) => {
    switch (type) {
      case 'lecture': return 'Лекция';
      case 'seminar': return 'Семинар';
      case 'lab': return 'Лабораторная';
      case 'exam': return 'Экзамен';
      case 'consultation': return 'Консультация';
      default: return 'Другое';
    }
  };

  const filteredCourses = courses.filter(course =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (typeFilter ? course.type === typeFilter : true)
  );

  // Загрузка студентов курса
  const loadCourseStudents = async (courseId: string) => {
    try {
      const q = query(collection(db, 'courseStudents'), where('courseId', '==', courseId));
      const querySnapshot = await getDocs(q);
      const studentIds = querySnapshot.docs.map(doc => doc.data().studentId);
      
      const students: Student[] = [];
      for (const studentId of studentIds) {
        const studentDoc = await getDoc(doc(db, 'users', studentId));
        if (studentDoc.exists()) {
          students.push({ id: studentId, ...studentDoc.data() } as Student);
        }
      }
      setCourseStudents(students);
    } catch (error) {
      showSnackbar('Ошибка при загрузке студентов', 'error');
    }
  };

  const handleOpenStudentsDialog = async (course: Course) => {
    setSelectedCourse(course);
    await loadCourseStudents(course.id);
    setStudentsDialogOpen(true);
  };

  const handleCloseStudentsDialog = () => {
    setStudentsDialogOpen(false);
    setSelectedCourse(null);
    setCourseStudents([]);
  };

  const handleAddStudentToCourse = async () => {
    if (!selectedCourse || !newStudent.email) return;

    try {
      // Находим пользователя по email
      const q = query(collection(db, 'users'), where('email', '==', newStudent.email));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        showSnackbar('Студент не найден', 'error');
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentId = studentDoc.id;

      // Проверяем, не добавлен ли уже студент
      const existingRef = query(
        collection(db, 'courseStudents'),
        where('courseId', '==', selectedCourse.id),
        where('studentId', '==', studentId)
      );
      const existing = await getDocs(existingRef);

      if (!existing.empty) {
        showSnackbar('Студент уже добавлен в курс', 'error');
        return;
      }

      // Добавляем студента в курс
      await addDoc(collection(db, 'courseStudents'), {
        courseId: selectedCourse.id,
        studentId: studentId,
        addedAt: new Date().toISOString()
      });

      // Обновляем список студентов
      await loadCourseStudents(selectedCourse.id);
      showSnackbar('Студент успешно добавлен в курс');
      
      // Очищаем форму
      setNewStudent({
        name: '',
        email: '',
        group: '',
        avatar: ''
      });
    } catch (error) {
      showSnackbar('Ошибка при добавлении студента', 'error');
    }
  };

  const handleRemoveStudentFromCourse = async (studentId: string) => {
    if (!selectedCourse) return;

    try {
      const q = query(
        collection(db, 'courseStudents'),
        where('courseId', '==', selectedCourse.id),
        where('studentId', '==', studentId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        await deleteDoc(doc(db, 'courseStudents', querySnapshot.docs[0].id));
        await loadCourseStudents(selectedCourse.id);
        showSnackbar('Студент успешно удален из курса');
      }
    } catch (error) {
      showSnackbar('Ошибка при удалении студента', 'error');
    }
  };

  // Загрузка оценок студента
  const loadStudentGrades = async (studentId: string, courseId: string) => {
    try {
      const q = query(
        collection(db, 'grades'),
        where('studentId', '==', studentId),
        where('courseId', '==', courseId)
      );
      const querySnapshot = await getDocs(q);
      const grades = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Grade[];
      setStudentGrades(grades);
    } catch (error) {
      showSnackbar('Ошибка при загрузке оценок', 'error');
    }
  };

  const handleOpenGradesDialog = async (student: Student) => {
    if (!selectedCourse) return;
    setSelectedStudent(student);
    await loadStudentGrades(student.id, selectedCourse.id);
    setNewGrade({
      studentId: student.id,
      courseId: selectedCourse.id,
      value: 0,
      type: 'exam',
      date: new Date().toISOString().split('T')[0],
      comment: ''
    });
    setGradesDialogOpen(true);
  };

  const handleCloseGradesDialog = () => {
    setGradesDialogOpen(false);
    setSelectedStudent(null);
    setStudentGrades([]);
  };

  const handleAddGrade = async () => {
    if (!selectedCourse || !selectedStudent) return;

    try {
      const gradeData = {
        ...newGrade,
        addedAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'grades'), gradeData);
      await loadStudentGrades(selectedStudent.id, selectedCourse.id);
      showSnackbar('Оценка успешно добавлена');

      // Очищаем форму
      setNewGrade({
        studentId: selectedStudent.id,
        courseId: selectedCourse.id,
        value: 0,
        type: 'exam',
        date: new Date().toISOString().split('T')[0],
        comment: ''
      });
    } catch (error) {
      showSnackbar('Ошибка при добавлении оценки', 'error');
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    try {
      await deleteDoc(doc(db, 'grades', gradeId));
      if (selectedStudent && selectedCourse) {
        await loadStudentGrades(selectedStudent.id, selectedCourse.id);
      }
      showSnackbar('Оценка успешно удалена');
    } catch (error) {
      showSnackbar('Ошибка при удалении оценки', 'error');
    }
  };

  const getGradeTypeName = (type: string) => {
    switch (type) {
      case 'exam': return 'Экзамен';
      case 'test': return 'Зачет';
      case 'homework': return 'Домашняя работа';
      case 'retake': return 'Пересдача';
      default: return 'Другое';
    }
  };

  // Отправка объявления
  const handleOpenAnnouncementDialog = (course: Course) => {
    setAnnouncementCourse(course);
    setAnnouncementText('');
    setAnnouncementDialogOpen(true);
  };

  const handleCloseAnnouncementDialog = () => {
    setAnnouncementDialogOpen(false);
    setAnnouncementText('');
    setAnnouncementCourse(null);
  };

  const handleSendAnnouncement = async () => {
    if (!announcementCourse || !announcementText.trim() || !user) return;
    setSendingAnnouncement(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        courseId: announcementCourse.id,
        text: announcementText.trim(),
        createdAt: new Date().toISOString(),
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Преподаватель'
      });
      showSnackbar('Объявление отправлено');
      handleCloseAnnouncementDialog();
    } catch (error) {
      showSnackbar('Ошибка при отправке объявления', 'error');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Мои курсы
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Поиск по названию курса"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          sx={{ minWidth: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Тип занятия</InputLabel>
          <Select
            value={typeFilter}
            label="Тип занятия"
            onChange={e => setTypeFilter(e.target.value)}
          >
            <MenuItem value="">Все типы</MenuItem>
            <MenuItem value="lecture">Лекция</MenuItem>
            <MenuItem value="seminar">Семинар</MenuItem>
            <MenuItem value="lab">Лабораторная</MenuItem>
            <MenuItem value="exam">Экзамен</MenuItem>
            <MenuItem value="consultation">Консультация</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCourseDialog}
        >
          Добавить курс
        </Button>
        <Button
          variant="outlined"
          sx={{ ml: 2 }}
          startIcon={<SchoolIcon />}
          onClick={() => {
            if (courses.length > 0) handleOpenAnnouncementDialog(courses[0]);
          }}
          disabled={courses.length === 0}
        >
          Отправить объявление
        </Button>
      </Box>

      {filteredCourses.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="textSecondary">
            {searchTerm || typeFilter ? 'Курсы не найдены' : 'У вас пока нет добавленных курсов'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredCourses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card 
                elevation={0} 
                sx={{ 
                  border: '1px solid rgba(0, 0, 0, 0.12)', 
                  borderRadius: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {course.name}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={getCourseTypeName(course.type)} 
                      size="small" 
                      sx={{ mr: 1, bgcolor: 'rgba(0, 0, 0, 0.05)' }}
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <CalendarIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    {getDayName(course.day)}, {course.startTime} - {course.endTime}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <LocationIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                    {course.building}, ауд. {course.room}
                  </Typography>
                  
                  {course.studentGroups.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Группы:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {course.studentGroups.map((group, idx) => (
                          <Chip 
                            key={idx} 
                            label={group} 
                            size="small" 
                            sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                
                <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', p: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleOpenStudentsDialog(course)}
                  >
                    <PeopleIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleEditCourse(course)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDeleteCourse(course.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Диалог добавления/редактирования курса */}
      <Dialog
        open={courseDialogOpen}
        onClose={handleCloseCourseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'var(--surface)'
          }
        }}
      >
        <DialogTitle>
          {editingCourse ? 'Редактировать курс' : 'Добавить курс'}
          <IconButton
            aria-label="close"
            onClick={handleCloseCourseDialog}
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
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Название курса"
                fullWidth
                variant="outlined"
                value={newCourse.name}
                onChange={handleCourseChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Тип занятия</InputLabel>
                <Select
                  name="course_type"
                  value={newCourse.type}
                  onChange={handleSelectChange}
                  label="Тип занятия"
                >
                  <MenuItem value="lecture">Лекция</MenuItem>
                  <MenuItem value="seminar">Семинар</MenuItem>
                  <MenuItem value="lab">Лабораторная</MenuItem>
                  <MenuItem value="exam">Экзамен</MenuItem>
                  <MenuItem value="consultation">Консультация</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>День недели</InputLabel>
                <Select
                  name="course_day"
                  value={newCourse.day.toString()}
                  onChange={handleSelectChange}
                  label="День недели"
                >
                  <MenuItem value="1">Понедельник</MenuItem>
                  <MenuItem value="2">Вторник</MenuItem>
                  <MenuItem value="3">Среда</MenuItem>
                  <MenuItem value="4">Четверг</MenuItem>
                  <MenuItem value="5">Пятница</MenuItem>
                  <MenuItem value="6">Суббота</MenuItem>
                  <MenuItem value="7">Воскресенье</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="startTime"
                label="Время начала"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newCourse.startTime}
                onChange={handleCourseChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="endTime"
                label="Время окончания"
                type="time"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={newCourse.endTime}
                onChange={handleCourseChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="building"
                label="Корпус"
                fullWidth
                variant="outlined"
                value={newCourse.building}
                onChange={handleCourseChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="room"
                label="Аудитория"
                fullWidth
                variant="outlined"
                value={newCourse.room}
                onChange={handleCourseChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Группы студентов (через запятую)"
                fullWidth
                variant="outlined"
                value={newCourse.studentGroups.join(', ')}
                onChange={(e) => setNewCourse({
                  ...newCourse,
                  studentGroups: e.target.value.split(',').map(g => g.trim()).filter(Boolean)
                })}
                helperText="Например: ИВТ-101, ПИ-202"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCourseDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveCourse}
            disabled={!newCourse.name || !newCourse.building || !newCourse.room}
          >
            {editingCourse ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог управления студентами */}
      <Dialog
        open={studentsDialogOpen}
        onClose={handleCloseStudentsDialog}
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
          Студенты курса {selectedCourse?.name}
          <IconButton
            aria-label="close"
            onClick={handleCloseStudentsDialog}
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Добавить студента
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Email студента"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                  placeholder="Введите email студента"
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleAddStudentToCourse}
                  disabled={!newStudent.email}
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            Список студентов
          </Typography>
          
          {courseStudents.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              В курсе пока нет студентов
            </Typography>
          ) : (
            <List>
              {courseStudents.map((student) => (
                <ListItem
                  key={student.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        edge="end" 
                        color="primary"
                        onClick={() => handleOpenGradesDialog(student)}
                      >
                        <GradeIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        color="error"
                        onClick={() => handleRemoveStudentFromCourse(student.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={student.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary">
                          {student.email}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Группа: {student.group}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог управления оценками */}
      <Dialog
        open={gradesDialogOpen}
        onClose={handleCloseGradesDialog}
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
          Оценки студента {selectedStudent?.name}
          <IconButton
            aria-label="close"
            onClick={handleCloseGradesDialog}
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Добавить оценку
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Тип оценки</InputLabel>
                  <Select
                    value={newGrade.type}
                    label="Тип оценки"
                    onChange={(e) => setNewGrade({ ...newGrade, type: e.target.value as Grade['type'] })}
                  >
                    <MenuItem value="exam">Экзамен</MenuItem>
                    <MenuItem value="test">Зачет</MenuItem>
                    <MenuItem value="homework">Домашняя работа</MenuItem>
                    <MenuItem value="retake">Пересдача</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="Оценка"
                  type="number"
                  fullWidth
                  size="small"
                  value={newGrade.value}
                  onChange={(e) => setNewGrade({ ...newGrade, value: Number(e.target.value) })}
                  InputProps={{ inputProps: { min: 0, max: 100 } }}
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <TextField
                  label="Дата"
                  type="date"
                  fullWidth
                  size="small"
                  value={newGrade.date}
                  onChange={(e) => setNewGrade({ ...newGrade, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Комментарий"
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  value={newGrade.comment}
                  onChange={(e) => setNewGrade({ ...newGrade, comment: e.target.value })}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  onClick={handleAddGrade}
                  disabled={!newGrade.value}
                >
                  Добавить оценку
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="subtitle1" gutterBottom>
            История оценок
          </Typography>
          
          {studentGrades.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Оценок пока нет
            </Typography>
          ) : (
            <List>
              {studentGrades.map((grade) => (
                <ListItem
                  key={grade.id}
                  secondaryAction={
                    <IconButton 
                      edge="end" 
                      color="error"
                      onClick={() => handleDeleteGrade(grade.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={getGradeTypeName(grade.type)} 
                          size="small" 
                          color={grade.type === 'retake' ? 'error' : 'default'}
                        />
                        <Typography variant="body1" fontWeight="medium">
                          {grade.value}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textSecondary">
                          {new Date(grade.date).toLocaleDateString()}
                        </Typography>
                        {grade.comment && (
                          <>
                            <br />
                            <Typography component="span" variant="body2">
                              {grade.comment}
                            </Typography>
                          </>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог отправки объявления */}
      <Dialog
        open={announcementDialogOpen}
        onClose={handleCloseAnnouncementDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: 'var(--surface)'
          }
        }}
      >
        <DialogTitle>
          Отправить объявление студентам курса
          <IconButton
            aria-label="close"
            onClick={handleCloseAnnouncementDialog}
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
          <Typography variant="subtitle1" gutterBottom>
            Курс: {announcementCourse?.name}
          </Typography>
          <TextField
            label="Текст объявления"
            fullWidth
            multiline
            minRows={3}
            value={announcementText}
            onChange={e => setAnnouncementText(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAnnouncementDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSendAnnouncement}
            disabled={!announcementText.trim() || sendingAnnouncement}
          >
            {sendingAnnouncement ? 'Отправка...' : 'Отправить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default TeacherCourses; 