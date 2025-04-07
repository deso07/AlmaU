import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Divider,
  Card,
  CardContent,
  Link,
  Tooltip,
  FormControlLabel,
  Switch,
  InputAdornment,
  Snackbar,
  Alert,
  Badge,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
  Event as EventIcon,
  BookmarkBorder as BookmarkIcon,
  Assessment as AssessmentIcon,
  PermContactCalendar as ContactIcon,
  GetApp as DownloadIcon,
  CheckCircle as VerifiedIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  Info as InfoIcon,
  Link as LinkIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Link as RouterLink } from 'react-router-dom';

// Types
interface Student {
  id: string;
  name: string;
  email: string;
  group: string;
  avatar?: string;
}

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

interface Publication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  url?: string;
  citations: number;
}

interface ContactHour {
  id: string;
  day: number;
  startTime: string;
  endTime: string;
  type: 'office' | 'online' | 'other';
  location: string;
  note?: string;
}

interface TeacherProfileData {
  id: string;
  name: string;
  photoURL: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  faculty: string;
  specialization: string[];
  bio: string;
  academicDegree: string;
  consultationInfo: string;
  socialLinks: {
    website?: string;
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };
  achievements: string[];
  courses: Course[];
  students: Student[];
  publications: Publication[];
  contactHours: ContactHour[];
}

const TeacherProfile: React.FC = () => {
  const { user } = useAuthStore();
  const isTeacher = user?.role === 'admin' || user?.role === 'teacher';
  const [tabValue, setTabValue] = useState(0);
  
  // Initial empty profile data
  const [profileData, setProfileData] = useState<TeacherProfileData>({
    id: '1',
    name: '',
    photoURL: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    faculty: '',
    specialization: [],
    bio: '',
    academicDegree: '',
    consultationInfo: '',
    socialLinks: {},
    achievements: [],
    courses: [],
    students: [],
    publications: [],
    contactHours: []
  });
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  
  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [contactHourDialogOpen, setContactHourDialogOpen] = useState(false);
  const [publicationDialogOpen, setPublicationDialogOpen] = useState(false);
  
  // New item states
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
  
  const [newStudent, setNewStudent] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    group: '',
    avatar: ''
  });
  
  const [newContactHour, setNewContactHour] = useState<Omit<ContactHour, 'id'>>({
    day: 1,
    startTime: '09:00',
    endTime: '10:30',
    type: 'office',
    location: '',
    note: ''
  });
  
  const [newPublication, setNewPublication] = useState<Omit<Publication, 'id'>>({
    title: '',
    authors: [''],
    journal: '',
    year: new Date().getFullYear(),
    url: '',
    citations: 0
  });
  
  // Search and filter states
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Tab handling
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Edit mode handling
  const handleToggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  const handleSaveProfile = () => {
    // Save profile data (in a real app, this would send data to a backend)
    setEditMode(false);
    showSnackbar('Профиль успешно обновлен');
  };
  
  // Dialog handlers
  const handleOpenCourseDialog = () => {
    setCourseDialogOpen(true);
  };
  
  const handleCloseCourseDialog = () => {
    setCourseDialogOpen(false);
  };
  
  const handleOpenStudentDialog = () => {
    setStudentDialogOpen(true);
  };
  
  const handleCloseStudentDialog = () => {
    setStudentDialogOpen(false);
  };
  
  const handleOpenContactHourDialog = () => {
    setContactHourDialogOpen(true);
  };
  
  const handleCloseContactHourDialog = () => {
    setContactHourDialogOpen(false);
  };
  
  const handleOpenPublicationDialog = () => {
    setPublicationDialogOpen(true);
  };
  
  const handleClosePublicationDialog = () => {
    setPublicationDialogOpen(false);
  };
  
  // Add new items
  const handleAddCourse = () => {
    const newCourseWithId: Course = {
      ...newCourse,
      id: `course_${Date.now()}`
    };
    
    setProfileData({
      ...profileData,
      courses: [...profileData.courses, newCourseWithId]
    });
    
    setCourseDialogOpen(false);
    showSnackbar('Курс успешно добавлен');
    
    // Reset form
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
  };
  
  const handleAddStudent = () => {
    const newStudentWithId: Student = {
      ...newStudent,
      id: `student_${Date.now()}`
    };
    
    setProfileData({
      ...profileData,
      students: [...profileData.students, newStudentWithId]
    });
    
    setStudentDialogOpen(false);
    showSnackbar('Студент успешно добавлен');
    
    // Reset form
    setNewStudent({
      name: '',
      email: '',
      group: '',
      avatar: ''
    });
  };
  
  const handleAddContactHour = () => {
    const newContactHourWithId: ContactHour = {
      ...newContactHour,
      id: `contact_${Date.now()}`
    };
    
    setProfileData({
      ...profileData,
      contactHours: [...profileData.contactHours, newContactHourWithId]
    });
    
    setContactHourDialogOpen(false);
    showSnackbar('Часы консультаций успешно добавлены');
    
    // Reset form
    setNewContactHour({
      day: 1,
      startTime: '09:00',
      endTime: '10:30',
      type: 'office',
      location: '',
      note: ''
    });
  };
  
  const handleAddPublication = () => {
    const newPublicationWithId: Publication = {
      ...newPublication,
      id: `publication_${Date.now()}`
    };
    
    setProfileData({
      ...profileData,
      publications: [...profileData.publications, newPublicationWithId]
    });
    
    setPublicationDialogOpen(false);
    showSnackbar('Публикация успешно добавлена');
    
    // Reset form
    setNewPublication({
      title: '',
      authors: [''],
      journal: '',
      year: new Date().getFullYear(),
      url: '',
      citations: 0
    });
  };
  
  // Delete items
  const handleDeleteCourse = (id: string) => {
    setProfileData({
      ...profileData,
      courses: profileData.courses.filter(course => course.id !== id)
    });
    showSnackbar('Курс успешно удален');
  };
  
  const handleDeleteStudent = (id: string) => {
    setProfileData({
      ...profileData,
      students: profileData.students.filter(student => student.id !== id)
    });
    showSnackbar('Студент успешно удален');
  };
  
  const handleDeleteContactHour = (id: string) => {
    setProfileData({
      ...profileData,
      contactHours: profileData.contactHours.filter(hour => hour.id !== id)
    });
    showSnackbar('Часы консультаций успешно удалены');
  };
  
  const handleDeletePublication = (id: string) => {
    setProfileData({
      ...profileData,
      publications: profileData.publications.filter(pub => pub.id !== id)
    });
    showSnackbar('Публикация успешно удалена');
  };
  
  // Input change handlers
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCourse({
      ...newCourse,
      [name]: value
    });
  };
  
  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewStudent({
      ...newStudent,
      [name]: value
    });
  };
  
  const handleContactHourChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewContactHour({
      ...newContactHour,
      [name]: value
    });
  };
  
  const handlePublicationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPublication({
      ...newPublication,
      [name]: value
    });
  };
  
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    
    if (name?.includes('course')) {
      setNewCourse({
        ...newCourse,
        [name.replace('course_', '')]: value
      });
    } else if (name?.includes('contactHour')) {
      setNewContactHour({
        ...newContactHour,
        [name.replace('contactHour_', '')]: value
      });
    }
  };
  
  const handleAuthorChange = (index: number, value: string) => {
    const updatedAuthors = [...newPublication.authors];
    updatedAuthors[index] = value;
    setNewPublication({ ...newPublication, authors: updatedAuthors });
  };
  
  const handleAddAuthor = () => {
    setNewPublication({
      ...newPublication,
      authors: [...newPublication.authors, '']
    });
  };
  
  const handleRemoveAuthor = (index: number) => {
    const updatedAuthors = [...newPublication.authors];
    updatedAuthors.splice(index, 1);
    setNewPublication({ ...newPublication, authors: updatedAuthors });
  };
  
  // Utility functions
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
  
  const getContactHourTypeName = (type: string) => {
    switch (type) {
      case 'office': return 'Очная консультация';
      case 'online': return 'Онлайн консультация';
      default: return 'Другое';
    }
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
  
  // Filter students by search term
  const filteredStudents = profileData.students.filter(student =>
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.group.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        Профиль преподавателя
      </Typography>
      
      <Grid container spacing={3}>
        {/* Left column - Teacher info */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3,
              borderRadius: 2,
              bgcolor: 'var(--surface)',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              mb: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Информация
              </Typography>
              
              {isTeacher && (
                <Button
                  startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                  size="small"
                  variant={editMode ? "contained" : "outlined"}
                  onClick={editMode ? handleSaveProfile : handleToggleEditMode}
                >
                  {editMode ? "Сохранить" : "Редактировать"}
                </Button>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  editMode ? (
                    <IconButton 
                      sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                      size="small"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  ) : null
                }
              >
                <Avatar 
                  src={profileData.photoURL || ""} 
                  alt={profileData.name || "Преподаватель"}
                  sx={{ width: 120, height: 120, mb: 2 }}
                />
              </Badge>
              
              {editMode ? (
                <TextField
                  name="name"
                  label="ФИО"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  sx={{ mb: 1 }}
                />
              ) : (
                <Typography variant="h6" align="center" gutterBottom>
                  {profileData.name || "Информация не заполнена"}
                </Typography>
              )}
              
              {editMode ? (
                <TextField
                  name="position"
                  label="Должность"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={profileData.position}
                  onChange={handleProfileChange}
                />
              ) : (
                <Typography variant="body2" color="textSecondary" align="center">
                  {profileData.position || "Должность не указана"}
                </Typography>
              )}
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <List disablePadding>
              <ListItem disableGutters sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <EmailIcon color="primary" fontSize="small" />
                </ListItemIcon>
                {editMode ? (
                  <TextField
                    name="email"
                    label="Email"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={profileData.email}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <ListItemText 
                    primary={profileData.email || "Email не указан"} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      component: profileData.email ? 'a' : 'span',
                      href: profileData.email ? `mailto:${profileData.email}` : undefined
                    }} 
                  />
                )}
              </ListItem>
              
              <ListItem disableGutters sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <PhoneIcon color="primary" fontSize="small" />
                </ListItemIcon>
                {editMode ? (
                  <TextField
                    name="phone"
                    label="Телефон"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <ListItemText 
                    primary={profileData.phone || "Телефон не указан"} 
                    primaryTypographyProps={{ 
                      variant: 'body2',
                      component: profileData.phone ? 'a' : 'span',
                      href: profileData.phone ? `tel:${profileData.phone}` : undefined
                    }}
                  />
                )}
              </ListItem>
              
              <ListItem disableGutters sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <SchoolIcon color="primary" fontSize="small" />
                </ListItemIcon>
                {editMode ? (
                  <TextField
                    name="academicDegree"
                    label="Ученая степень"
                    fullWidth
                    variant="outlined"
                    size="small"
                    value={profileData.academicDegree}
                    onChange={handleProfileChange}
                  />
                ) : (
                  <ListItemText 
                    primary={profileData.academicDegree || "Ученая степень не указана"} 
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                )}
              </ListItem>
              
              <ListItem disableGutters sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <BusinessIcon color="primary" fontSize="small" />
                </ListItemIcon>
                {editMode ? (
                  <Box sx={{ width: '100%' }}>
                    <TextField
                      name="department"
                      label="Кафедра"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={profileData.department}
                      onChange={handleProfileChange}
                      sx={{ mb: 1 }}
                    />
                    <TextField
                      name="faculty"
                      label="Факультет"
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={profileData.faculty}
                      onChange={handleProfileChange}
                    />
                  </Box>
                ) : (
                  <ListItemText 
                    primary={profileData.department || "Кафедра не указана"} 
                    secondary={profileData.faculty || "Факультет не указан"}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'body2', color: 'textSecondary' }}
                  />
                )}
              </ListItem>
            </List>
            
            {editMode && (
              <>
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  Специализация
                </Typography>
                
                <TextField
                  name="specialization"
                  label="Области специализации (через запятую)"
                  fullWidth
                  variant="outlined"
                  size="small"
                  value={profileData.specialization.join(', ')}
                  onChange={(e) => setProfileData({
                    ...profileData,
                    specialization: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  helperText="Например: Машинное обучение, Компьютерное зрение"
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle2" gutterBottom>
                  О преподавателе
                </Typography>
                
                <TextField
                  name="bio"
                  label="Информация о себе"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  value={profileData.bio}
                  onChange={handleProfileChange}
                />
              </>
            )}
          </Paper>
          
          {!editMode && (
            <>
              {/* Специализации */}
              {profileData.specialization.length > 0 && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'var(--surface)',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    mb: 3
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Специализация
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {profileData.specialization.map((specialization, index) => (
                      <Chip 
                        key={index} 
                        label={specialization} 
                        sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}
                      />
                    ))}
                  </Box>
                </Paper>
              )}
              
              {/* О преподавателе */}
              {profileData.bio && (
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'var(--surface)',
                    border: '1px solid rgba(0, 0, 0, 0.12)',
                    mb: 3
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    О преподавателе
                  </Typography>
                  
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {profileData.bio}
                  </Typography>
                </Paper>
              )}
              
              {/* Часы консультаций */}
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3,
                  borderRadius: 2,
                  bgcolor: 'var(--surface)',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  mb: 3
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Часы консультаций
                  </Typography>
                  
                  {isTeacher && (
                    <Button
                      startIcon={<AddIcon />}
                      size="small"
                      variant="outlined"
                      onClick={handleOpenContactHourDialog}
                    >
                      Добавить
                    </Button>
                  )}
                </Box>
                
                {profileData.contactHours.length === 0 ? (
                  <Typography variant="body2" color="textSecondary">
                    Часы консультаций не указаны
                  </Typography>
                ) : (
                  <List disablePadding>
                    {profileData.contactHours.map((hour) => (
                      <React.Fragment key={hour.id}>
                        <ListItem sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <ScheduleIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText
                            primary={`${getDayName(hour.day)}, ${hour.startTime} - ${hour.endTime}`}
                            secondary={
                              <>
                                <Typography variant="body2" component="span">
                                  {getContactHourTypeName(hour.type)}
                                </Typography>
                                <Typography variant="body2" component="span" color="textSecondary">
                                  {hour.location && `, ${hour.location}`}
                                </Typography>
                                {hour.note && (
                                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                                    {hour.note}
                                  </Typography>
                                )}
                              </>
                            }
                          />
                          {isTeacher && (
                            <IconButton 
                              edge="end" 
                              size="small" 
                              color="error"
                              onClick={() => handleDeleteContactHour(hour.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Paper>
            </>
          )}
        </Grid>
        
        {/* Right column - Tabs */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              bgcolor: 'var(--surface)',
              border: '1px solid rgba(0, 0, 0, 0.12)',
              overflow: 'hidden'
            }}
          >
            <Tabs 
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'rgba(0, 0, 0, 0.02)', px: 2 }}
            >
              <Tab label="Курсы" icon={<SchoolIcon />} iconPosition="start" />
              <Tab label="Студенты" icon={<PersonIcon />} iconPosition="start" />
              <Tab label="Публикации" icon={<BookmarkIcon />} iconPosition="start" />
            </Tabs>
            
            {/* Курсы */}
            <TabPanel value={tabValue} index={0}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Преподаваемые курсы
                  </Typography>
                  
                  {isTeacher && (
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      onClick={handleOpenCourseDialog}
                    >
                      Добавить курс
                    </Button>
                  )}
                </Box>
                
                {profileData.courses.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      Курсы не добавлены
                    </Typography>
                    {isTeacher && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCourseDialog}
                        sx={{ mt: 1 }}
                      >
                        Добавить первый курс
                      </Button>
                    )}
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {profileData.courses.map((course) => (
                      <Grid item xs={12} sm={6} key={course.id}>
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
                          
                          {isTeacher && (
                            <Box sx={{ borderTop: '1px solid rgba(0, 0, 0, 0.12)', p: 1, display: 'flex', justifyContent: 'flex-end' }}>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteCourse(course.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </TabPanel>
            
            {/* Студенты */}
            <TabPanel value={tabValue} index={1}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Список студентов
                  </Typography>
                  
                  {isTeacher && (
                    <Button
                      startIcon={<PersonAddIcon />}
                      variant="outlined"
                      onClick={handleOpenStudentDialog}
                    >
                      Добавить студента
                    </Button>
                  )}
                </Box>
                
                <TextField
                  placeholder="Поиск по имени, email или группе..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: studentSearchTerm ? (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setStudentSearchTerm('')}>
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ) : null
                  }}
                  sx={{ mb: 2 }}
                />
                
                {filteredStudents.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      {studentSearchTerm ? 'Студенты не найдены' : 'Студенты не добавлены'}
                    </Typography>
                    {isTeacher && !studentSearchTerm && (
                      <Button
                        variant="contained"
                        startIcon={<PersonAddIcon />}
                        onClick={handleOpenStudentDialog}
                        sx={{ mt: 1 }}
                      >
                        Добавить первого студента
                      </Button>
                    )}
                  </Box>
                ) : (
                  <List sx={{ bgcolor: 'background.paper' }}>
                    {filteredStudents.map((student) => (
                      <React.Fragment key={student.id}>
                        <ListItem
                          secondaryAction={
                            isTeacher && (
                              <IconButton 
                                edge="end" 
                                color="error"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            )
                          }
                        >
                          <ListItemAvatar>
                            <Avatar src={student.avatar} alt={student.name}>
                              {student.name.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
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
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </TabPanel>
            
            {/* Публикации */}
            <TabPanel value={tabValue} index={2}>
              <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Научные публикации
                  </Typography>
                  
                  {isTeacher && (
                    <Button
                      startIcon={<AddIcon />}
                      variant="outlined"
                      onClick={handleOpenPublicationDialog}
                    >
                      Добавить публикацию
                    </Button>
                  )}
                </Box>
                
                {profileData.publications.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="textSecondary" gutterBottom>
                      Публикации не добавлены
                    </Typography>
                    {isTeacher && (
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenPublicationDialog}
                        sx={{ mt: 1 }}
                      >
                        Добавить первую публикацию
                      </Button>
                    )}
                  </Box>
                ) : (
                  <List disablePadding>
                    {profileData.publications.map((publication) => (
                      <React.Fragment key={publication.id}>
                        <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ pr: isTeacher ? 4 : 0 }}>
                                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                  {publication.title}
                                </Typography>
                                
                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                  {publication.authors.join(', ')}
                                </Typography>
                                
                                <Typography variant="body2">
                                  <strong>{publication.journal}</strong>, {publication.year}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  {publication.url && (
                                    <Button 
                                      component="a"
                                      href={publication.url}
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      startIcon={<LinkIcon />}
                                      size="small"
                                      sx={{ mr: 2 }}
                                    >
                                      Открыть
                                    </Button>
                                  )}
                                  
                                  <Chip 
                                    label={`Цитирований: ${publication.citations}`} 
                                    size="small" 
                                    sx={{ bgcolor: 'rgba(0, 0, 0, 0.05)' }}
                                  />
                                </Box>
                              </Box>
                            }
                          />
                          
                          {isTeacher && (
                            <ListItemSecondaryAction>
                              <IconButton 
                                edge="end" 
                                color="error"
                                onClick={() => handleDeletePublication(publication.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                        <Divider component="li" />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            </TabPanel>
          </Paper>
          
          {isTeacher && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                component={RouterLink}
                to="/grades"
                variant="contained"
                startIcon={<AssessmentIcon />}
              >
                Журнал оценок
              </Button>
              
              <Button
                component={RouterLink}
                to="/schedule"
                variant="outlined"
                startIcon={<ScheduleIcon />}
              >
                Расписание занятий
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>
      
      {/* Course Dialog */}
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
          Добавить курс
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
            onClick={handleAddCourse}
            disabled={!newCourse.name || !newCourse.building || !newCourse.room}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Student Dialog */}
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
          Добавить студента
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
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="ФИО студента"
                fullWidth
                variant="outlined"
                value={newStudent.name}
                onChange={handleStudentChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                value={newStudent.email}
                onChange={handleStudentChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="group"
                label="Группа"
                fullWidth
                variant="outlined"
                value={newStudent.group}
                onChange={handleStudentChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseStudentDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddStudent}
            disabled={!newStudent.name || !newStudent.email || !newStudent.group}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Contact Hour Dialog */}
      <Dialog
        open={contactHourDialogOpen}
        onClose={handleCloseContactHourDialog}
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
          Добавить часы консультаций
          <IconButton
            aria-label="close"
            onClick={handleCloseContactHourDialog}
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
              <FormControl fullWidth>
                <InputLabel>День недели</InputLabel>
                <Select
                  name="contactHour_day"
                  value={newContactHour.day.toString()}
                  onChange={handleSelectChange}
                  label="День недели"
                >
                  <MenuItem value={1}>Понедельник</MenuItem>
                  <MenuItem value={2}>Вторник</MenuItem>
                  <MenuItem value={3}>Среда</MenuItem>
                  <MenuItem value={4}>Четверг</MenuItem>
                  <MenuItem value={5}>Пятница</MenuItem>
                  <MenuItem value={6}>Суббота</MenuItem>
                  <MenuItem value={7}>Воскресенье</MenuItem>
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
                value={newContactHour.startTime}
                onChange={handleContactHourChange}
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
                value={newContactHour.endTime}
                onChange={handleContactHourChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Тип консультации</InputLabel>
                <Select
                  name="contactHour_type"
                  value={newContactHour.type}
                  onChange={handleSelectChange}
                  label="Тип консультации"
                >
                  <MenuItem value="office">Очная консультация</MenuItem>
                  <MenuItem value="online">Онлайн консультация</MenuItem>
                  <MenuItem value="other">Другое</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="location"
                label="Место проведения"
                fullWidth
                variant="outlined"
                value={newContactHour.location}
                onChange={handleContactHourChange}
                placeholder={newContactHour.type === 'online' ? 'Ссылка на Zoom, Teams и т.п.' : 'Аудитория, корпус'}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="note"
                label="Примечание (опционально)"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={newContactHour.note}
                onChange={handleContactHourChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseContactHourDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddContactHour}
            disabled={!newContactHour.location}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Publication Dialog */}
      <Dialog
        open={publicationDialogOpen}
        onClose={handleClosePublicationDialog}
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
          Добавить публикацию
          <IconButton
            aria-label="close"
            onClick={handleClosePublicationDialog}
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
                name="title"
                label="Название публикации"
                fullWidth
                variant="outlined"
                value={newPublication.title}
                onChange={handlePublicationChange}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Авторы
              </Typography>
              
              {newPublication.authors.map((author, index) => (
                <Box key={index} sx={{ display: 'flex', mb: 2, gap: 1 }}>
                  <TextField
                    fullWidth
                    label={`Автор ${index + 1}`}
                    value={author}
                    onChange={(e) => handleAuthorChange(index, e.target.value)}
                    variant="outlined"
                  />
                  
                  {newPublication.authors.length > 1 && (
                    <IconButton color="error" onClick={() => handleRemoveAuthor(index)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={handleAddAuthor}
                variant="outlined"
                size="small"
              >
                Добавить автора
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="journal"
                label="Журнал/Сборник"
                fullWidth
                variant="outlined"
                value={newPublication.journal}
                onChange={handlePublicationChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="year"
                label="Год публикации"
                type="number"
                fullWidth
                variant="outlined"
                value={newPublication.year}
                onChange={handlePublicationChange}
                required
                InputProps={{ inputProps: { min: 1900, max: new Date().getFullYear() } }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="url"
                label="Ссылка (опционально)"
                type="url"
                fullWidth
                variant="outlined"
                value={newPublication.url}
                onChange={handlePublicationChange}
                placeholder="https://"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="citations"
                label="Количество цитирований"
                type="number"
                fullWidth
                variant="outlined"
                value={newPublication.citations}
                onChange={handlePublicationChange}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleClosePublicationDialog} color="inherit">
            Отмена
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddPublication}
            disabled={!newPublication.title || !newPublication.journal || newPublication.authors.some(a => !a.trim())}
          >
            Добавить
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

// TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

export default TeacherProfile;
