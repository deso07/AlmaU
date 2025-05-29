import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Avatar,
  Tabs,
  Tab
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import StudentDashboard from '../components/StudentDashboard';
import Leaderboard from '../components/Leaderboard';
import FeedbackForm from '../components/FeedbackForm';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState(0);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        {user?.displayName ? `Привет, ${user.displayName.split(' ')[0]}!` : 'Добро пожаловать!'}
      </Typography>
      
      <Grid container spacing={2} sx={{ width: '100%', m: 0 }}>
        <Grid item xs={12} md={4} sx={{ width: '100%' }}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, height: '100%', borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)', bgcolor: 'var(--surface)', width: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
              <Avatar
                src={user?.photoURL || ""}
                alt={user?.displayName || "User"}
                sx={{ width: 80, height: 80, mb: 1 }}
              />
              <Typography variant="h6" align="center">
                {user?.displayName || "Заполните профиль"}
              </Typography>
              <Typography variant="body2" color="textSecondary" align="center">
                {user?.university ? `${user.university}` : "Добавьте информацию о себе"}
                {user?.faculty ? `, ${user.faculty}` : ""}
                {user?.year ? `, ${user.year} курс` : ""}
              </Typography>
            </Box>
            
            <Button
              component={RouterLink}
              to="/settings"
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
            >
              Редактировать профиль
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8} sx={{ width: '100%' }}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)', bgcolor: 'var(--surface)', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Предстоящие задачи
              </Typography>
              <Button
                component={RouterLink}
                to="/tasks"
                variant="text"
                color="primary"
              >
                Все задачи
              </Button>
            </Box>
            
            {/* Placeholder for tasks */}
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                У вас пока нет задач
              </Typography>
              <Button
                component={RouterLink}
                to="/tasks"
                variant="contained"
                sx={{ mt: 1 }}
              >
                Добавить задачу
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sx={{ width: '100%' }}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)', bgcolor: 'var(--surface)', width: '100%' }}>
            <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tab label="Аналитика и прогресс" />
              <Tab label="Рейтинг студентов" />
              <Tab label="Обратная связь" />
            </Tabs>

            {activeTab === 0 && <StudentDashboard />}
            {activeTab === 1 && <Leaderboard />}
            {activeTab === 2 && (
              <FeedbackForm
                courseId="current-course"
                teacherId="current-teacher"
              />
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} sx={{ width: '100%' }}>
          <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.12)', bgcolor: 'var(--surface)', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight="bold">
                Расписание на сегодня
              </Typography>
              <Button
                component={RouterLink}
                to="/schedule"
                variant="text"
                color="primary"
              >
                Полное расписание
              </Button>
            </Box>
            
            {/* Placeholder for schedule */}
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                Нет занятий на сегодня
              </Typography>
              <Button
                component={RouterLink}
                to="/schedule"
                variant="contained"
                sx={{ mt: 1 }}
              >
                Добавить расписание
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
