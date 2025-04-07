import React, { useState } from 'react';
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
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Divider,
  TablePagination,
  TableSortLabel,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  FilterList as FilterIcon,
  ImportExport as ExportIcon,
  Print as PrintIcon,
  MoreVert as MoreVertIcon,
  Check as CheckIcon,
  Save as SaveIcon,
  FileCopy as CopyIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';

// Types
interface Student {
  id: string;
  name: string;
  group: string;
  studentId: string;
}

interface Course {
  id: string;
  name: string;
  semester: string;
  creditHours: number;
}

interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  value: number | null;
  date: string;
  type: 'exam' | 'midterm' | 'homework' | 'project' | 'other';
  comment?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

const GradesJournal: React.FC = () => {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'admin' || user?.role === 'teacher';
  
  // States
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<'name' | 'group'>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  
  // Dialog states
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  
  // Anchor for menu
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [actionStudent, setActionStudent] = useState<Student | null>(null);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // New grade form
  const [newGrade, setNewGrade] = useState<Omit<Grade, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>>({
    studentId: '',
    courseId: '',
    value: null,
    date: new Date().toISOString().split('T')[0],
    type: 'exam'
  });
  
  // New student form
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    group: '',
    studentId: ''
  });
  
  // New course form
  const [newCourse, setNewCourse] = useState<Omit<Course, 'id'>>({
    name: '',
    semester: '',
    creditHours: 3
  });
  
  // Semesters and grade types
  const semesters = ['2023-2024-1', '2023-2024-2', '2024-2025-1', '2024-2025-2'];
  const gradeTypes = [
    { id: 'exam', name: 'Экзамен' },
    { id: 'midterm', name: 'Промежуточный экзамен' },
    { id: 'homework', name: 'Домашнее задание' },
    { id: 'project', name: 'Проект' },
    { id: 'other', name: 'Другое' }
  ];
  
  // Filtered data
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.group.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // Sorted students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const comparison = order === 'asc' ? 1 : -1;
    return (a[orderBy] > b[orderBy] ? 1 : -1) * comparison;
  });
  
  // Pagination
  const paginatedStudents = sortedStudents.slice(
    page * rowsPerPage, 
    page * rowsPerPage + rowsPerPage
  );
  
  // Filtered courses based on selected semester
  const filteredCourses = courses.filter(course => {
    return selectedSemester === '' || course.semester === selectedSemester;
  });
  
  // Filtered grades based on selected course and student
  const getStudentGrades = (studentId: string) => {
    return grades.filter(grade => {
      const matchesCourse = selectedCourse === '' || grade.courseId === selectedCourse;
      return grade.studentId === studentId && matchesCourse;
    });
  };
  
  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  const handleSort = (property: 'name' | 'group') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const handleOpenGradeDialog = (student: Student) => {
    setSelectedStudent(student);
    setNewGrade({
      studentId: student.id,
      courseId: selectedCourse || '',
      value: null,
      date: new Date().toISOString().split('T')[0],
      type: 'exam'
    });
    setGradeDialogOpen(true);
  };
  
  const handleCloseGradeDialog = () => {
    setGradeDialogOpen(false);
    setSelectedStudent(null);
    setSelectedGrade(null);
  };
  
  const handleOpenStudentDialog = (student?: Student) => {
    if (student) {
      setNewStudent({
        name: student.name,
        group: student.group,
        studentId: student.studentId
      });
      setSelectedStudent(student);
    } else {
      setNewStudent({
        name: '',
        group: '',
        studentId: ''
      });
      setSelectedStudent(null);
    }
    setStudentDialogOpen(true);
  };
  
  const handleCloseStudentDialog = () => {
    setStudentDialogOpen(false);
  };
  
  const handleOpenCourseDialog = (course?: Course) => {
    if (course) {
      setNewCourse({
        name: course.name,
        semester: course.semester,
        creditHours: course.creditHours
      });
      // You would need to add a selectedCourse state if you want to edit courses
    } else {
      setNewCourse({
        name: '',
        semester: selectedSemester || semesters[0],
        creditHours: 3
      });
    }
    setCourseDialogOpen(true);
  };
  
  const handleCloseCourseDialog = () => {
    setCourseDialogOpen(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (gradeDialogOpen) {
      if (name === 'value') {
        const numericValue = value === '' ? null : Number(value);
        setNewGrade(prev => ({ ...prev, [name]: numericValue }));
      } else {
        setNewGrade(prev => ({ ...prev, [name]: value }));
      }
    } else if (studentDialogOpen) {
      setNewStudent(prev => ({ ...prev, [name]: value }));
    } else if (courseDialogOpen) {
      if (name === 'creditHours') {
        setNewCourse(prev => ({ ...prev, [name]: Number(value) }));
      } else {
        setNewCourse(prev => ({ ...prev, [name]: value }));
      }
    }
  };
  
  const handleSelectChange = (event: any) => {
    const { name, value } = event.target;
    
    if (gradeDialogOpen) {
      setNewGrade(prev => ({ ...prev, [name]: value }));
    } else if (courseDialogOpen) {
      setNewCourse(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSaveGrade = () => {
    // Validate
    if (!newGrade.studentId || !newGrade.courseId || newGrade.value === null) {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, заполните все поля',
        severity: 'error'
      });
      return;
    }
    
    const now = new Date().toISOString();
    
    if (selectedGrade) {
      // Update existing grade
      setGrades(prev => prev.map(grade => 
        grade.id === selectedGrade.id ? {
          ...grade,
          value: newGrade.value,
          type: newGrade.type,
          date: newGrade.date,
          comment: newGrade.comment,
          updatedAt: now
        } : grade
      ));
      
      setSnackbar({
        open: true,
        message: 'Оценка успешно обновлена',
        severity: 'success'
      });
    } else {
      // Add new grade
      const newGradeItem: Grade = {
        id: `grade_${Date.now()}`,
        studentId: newGrade.studentId,
        courseId: newGrade.courseId,
        value: newGrade.value,
        date: newGrade.date,
        type: newGrade.type,
        comment: newGrade.comment,
        createdAt: now,
        updatedAt: now,
        createdBy: user?.uid || ''
      };
      
      setGrades(prev => [...prev, newGradeItem]);
      
      setSnackbar({
        open: true,
        message: 'Оценка успешно добавлена',
        severity: 'success'
      });
    }
    
    handleCloseGradeDialog();
  };
  
  const handleSaveStudent = () => {
    // Validate
    if (!newStudent.name || !newStudent.group || !newStudent.studentId) {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, заполните все поля',
        severity: 'error'
      });
      return;
    }
    
    if (selectedStudent) {
      // Update existing student
      setStudents(prev => prev.map(student => 
        student.id === selectedStudent.id ? {
          ...student,
          name: newStudent.name,
          group: newStudent.group,
          studentId: newStudent.studentId
        } : student
      ));
      
      setSnackbar({
        open: true,
        message: 'Информация о студенте обновлена',
        severity: 'success'
      });
    } else {
      // Add new student
      const newStudentItem: Student = {
        id: `student_${Date.now()}`,
        name: newStudent.name,
        group: newStudent.group,
        studentId: newStudent.studentId
      };
      
      setStudents(prev => [...prev, newStudentItem]);
      
      setSnackbar({
        open: true,
        message: 'Студент успешно добавлен',
        severity: 'success'
      });
    }
    
    handleCloseStudentDialog();
  };
  
  const handleSaveCourse = () => {
    // Validate
    if (!newCourse.name || !newCourse.semester) {
      setSnackbar({
        open: true,
        message: 'Пожалуйста, заполните все поля',
        severity: 'error'
      });
      return;
    }
    
    // Add new course
    const newCourseItem: Course = {
      id: `course_${Date.now()}`,
      name: newCourse.name,
      semester: newCourse.semester,
      creditHours: newCourse.creditHours
    };
    
    setCourses(prev => [...prev, newCourseItem]);
    
    setSnackbar({
      open: true,
      message: 'Дисциплина успешно добавлена',
      severity: 'success'
    });
    
    handleCloseCourseDialog();
  };
  
  const handleDeleteStudent = (id: string) => {
    // Delete student
    setStudents(prev => prev.filter(student => student.id !== id));
    
    // Delete all associated grades
    setGrades(prev => prev.filter(grade => grade.studentId !== id));
    
    setSnackbar({
      open: true,
      message: 'Студент и все связанные оценки удалены',
      severity: 'success'
    });
    
    handleCloseMenu();
  };
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, student: Student) => {
    setMenuAnchorEl(event.currentTarget);
    setActionStudent(student);
  };
  
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActionStudent(null);
  };
  
  const getGradeColor = (value: number | null): string => {
    if (value === null) return 'inherit';
    if (value >= 90) return 'success.main';
    if (value >= 75) return 'primary.main';
    if (value >= 60) return 'warning.main';
    return 'error.main';
  };
  
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Журнал оценок
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isTeacher && (
            <>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => handleOpenCourseDialog()}
              >
                Добавить дисциплину
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenStudentDialog()}
              >
                Добавить студента
              </Button>
            </>
          )}
        </Box>
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
            placeholder="Поиск по имени, группе или номеру студенческого..."
            variant="outlined"
            fullWidth
            size="medium"
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
          
          <FormControl variant="outlined" size="medium" sx={{ minWidth: 200 }}>
            <InputLabel>Семестр</InputLabel>
            <Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as string)}
              label="Семестр"
            >
              <MenuItem value="">Все семестры</MenuItem>
              {semesters.map(semester => (
                <MenuItem key={semester} value={semester}>{semester}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl variant="outlined" size="medium" sx={{ minWidth: 250 }}>
            <InputLabel>Дисциплина</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value as string)}
              label="Дисциплина"
              disabled={filteredCourses.length === 0}
            >
              <MenuItem value="">Все дисциплины</MenuItem>
              {filteredCourses.map(course => (
                <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        
        <Tabs 
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Все студенты" />
          <Tab label="По группам" />
          <Tab label="Статистика" />
        </Tabs>
      </Paper>
      
      {/* Main content - list of students with grades */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          bgcolor: 'var(--surface)',
          border: '1px solid rgba(0, 0, 0, 0.12)'
        }}
      >
        <TabPanel value={tabValue} index={0}>
          {paginatedStudents.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="textSecondary" gutterBottom>
                Студенты не найдены
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Добавьте студентов в систему'}
              </Typography>
              {isTeacher && (
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                  onClick={() => handleOpenStudentDialog()}
                >
                  Добавить студента
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'name'}
                        direction={orderBy === 'name' ? order : 'asc'}
                        onClick={() => handleSort('name')}
                      >
                        ФИО студента
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'group'}
                        direction={orderBy === 'group' ? order : 'asc'}
                        onClick={() => handleSort('group')}
                      >
                        Группа
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Номер студенческого</TableCell>
                    
                    {selectedCourse ? (
                      <TableCell align="center">Оценка</TableCell>
                    ) : (
                      <TableCell align="center">Средний балл</TableCell>
                    )}
                    
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStudents.map((student) => {
                    const studentGrades = getStudentGrades(student.id);
                    const avgGrade = studentGrades.length > 0 
                      ? studentGrades.reduce((sum, grade) => sum + (grade.value || 0), 0) / studentGrades.length 
                      : null;
                    
                    // Get the most recent grade for the selected course
                    const currentGrade = selectedCourse && studentGrades.length > 0 
                      ? studentGrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
                      : null;
                    
                    return (
                      <TableRow key={student.id} hover>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{student.group}</TableCell>
                        <TableCell>{student.studentId}</TableCell>
                        
                        {/* Grade cell */}
                        <TableCell align="center">
                          {selectedCourse ? (
                            currentGrade ? (
                              <Tooltip 
                                title={`${currentGrade.type === 'exam' ? 'Экзамен' : 'Другое'}, ${new Date(currentGrade.date).toLocaleDateString()}`} 
                                arrow
                              >
                                <Chip 
                                  label={currentGrade.value} 
                                  sx={{ 
                                    fontWeight: 'bold',
                                    bgcolor: 'rgba(0, 0, 0, 0.05)',
                                    color: getGradeColor(currentGrade.value)
                                  }} 
                                />
                              </Tooltip>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Нет оценки
                              </Typography>
                            )
                          ) : (
                            avgGrade !== null ? (
                              <Chip 
                                label={avgGrade.toFixed(1)} 
                                sx={{ 
                                  fontWeight: 'bold',
                                  bgcolor: 'rgba(0, 0, 0, 0.05)',
                                  color: getGradeColor(avgGrade)
                                }} 
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                Нет оценок
                              </Typography>
                            )
                          )}
                        </TableCell>
                        
                        {/* Actions cell */}
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {isTeacher && selectedCourse && (
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={currentGrade ? <EditIcon /> : <AddIcon />}
                                onClick={() => handleOpenGradeDialog(student)}
                                sx={{ mr: 1 }}
                              >
                                {currentGrade ? 'Изменить' : 'Добавить оценку'}
                              </Button>
                            )}
                            
                            <IconButton
                              size="small"
                              onClick={(e) => handleOpenMenu(e, student)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredStudents.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Строк на странице:"
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Просмотр по группам скоро будет доступен
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Мы работаем над этой функцией
            </Typography>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Статистика успеваемости скоро будет доступна
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Мы работаем над этой функцией
            </Typography>
          </Box>
        </TabPanel>
      </Paper>
      
      {/* Menu for student actions */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: 2
          }
        }}
      >
        <MenuItem onClick={() => {
          handleCloseMenu();
          actionStudent && handleOpenStudentDialog(actionStudent);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Редактировать" />
        </MenuItem>
        
        <MenuItem onClick={() => {
          handleCloseMenu();
          // Implement view grades functionality
        }}>
          <ListItemIcon>
            <CopyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Просмотр всех оценок" />
        </MenuItem>
        
        <Divider />
        
        {isTeacher && (
          <MenuItem onClick={() => {
            actionStudent && handleDeleteStudent(actionStudent.id);
          }} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText primary="Удалить" />
          </MenuItem>
        )}
      </Menu>
      
      {/* Dialog for adding/editing grade */}
      <Dialog
        open={gradeDialogOpen}
        onClose={handleCloseGradeDialog}
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
          {selectedGrade ? 'Изменить оценку' : 'Добавить оценку'}
          <IconButton
            aria-label="close"
            onClick={handleCloseGradeDialog}
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
            {selectedStudent && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Студент:
                </Typography>
                <Typography variant="body1">
                  {selectedStudent.name}, группа {selectedStudent.group}
                </Typography>
              </Box>
            )}
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Дисциплина</InputLabel>
              <Select
                name="courseId"
                value={newGrade.courseId}
                onChange={handleSelectChange}
                label="Дисциплина"
                disabled={!!selectedCourse}
              >
                {filteredCourses.map(course => (
                  <MenuItem key={course.id} value={course.id}>{course.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                name="value"
                label="Оценка"
                type="number"
                variant="outlined"
                value={newGrade.value === null ? '' : newGrade.value}
                onChange={handleInputChange}
                required
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                sx={{ width: '40%' }}
              />
              
              <FormControl variant="outlined" sx={{ width: '60%' }}>
                <InputLabel>Тип оценки</InputLabel>
                <Select
                  name="type"
                  value={newGrade.type}
                  onChange={handleSelectChange}
                  label="Тип оценки"
                >
                  {gradeTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            
            <TextField
              name="date"
              label="Дата"
              type="date"
              variant="outlined"
              fullWidth
              value={newGrade.date}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              name="comment"
              label="Комментарий (опционально)"
              variant="outlined"
              fullWidth
              multiline
              rows={2}
              value={newGrade.comment || ''}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseGradeDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveGrade}
            disabled={!newGrade.courseId || newGrade.value === null}
          >
            {selectedGrade ? 'Сохранить изменения' : 'Добавить оценку'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for adding/editing student */}
      <Dialog
        open={studentDialogOpen}
        onClose={handleCloseStudentDialog}
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
          {selectedStudent ? 'Редактировать студента' : 'Добавить студента'}
          <IconButton
            aria-label="close"
            onClick={handleCloseStudentDialog}
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
              name="name"
              label="ФИО студента"
              fullWidth
              variant="outlined"
              value={newStudent.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              name="group"
              label="Группа"
              fullWidth
              variant="outlined"
              value={newStudent.group}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              name="studentId"
              label="Номер студенческого"
              fullWidth
              variant="outlined"
              value={newStudent.studentId}
              onChange={handleInputChange}
              required
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseStudentDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveStudent}
            disabled={!newStudent.name || !newStudent.group || !newStudent.studentId}
          >
            {selectedStudent ? 'Сохранить изменения' : 'Добавить студента'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Dialog for adding course */}
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
          Добавить дисциплину
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
          <Box sx={{ mt: 1 }}>
            <TextField
              name="name"
              label="Название дисциплины"
              fullWidth
              variant="outlined"
              value={newCourse.name}
              onChange={handleInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
              <InputLabel>Семестр</InputLabel>
              <Select
                name="semester"
                value={newCourse.semester}
                onChange={handleSelectChange}
                label="Семестр"
              >
                {semesters.map(semester => (
                  <MenuItem key={semester} value={semester}>{semester}</MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              name="creditHours"
              label="Количество кредитов"
              type="number"
              fullWidth
              variant="outlined"
              value={newCourse.creditHours}
              onChange={handleInputChange}
              InputProps={{ inputProps: { min: 1, max: 10 } }}
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseCourseDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveCourse}
            disabled={!newCourse.name || !newCourse.semester}
          >
            Добавить дисциплину
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

// Tab Panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

export default GradesJournal;
