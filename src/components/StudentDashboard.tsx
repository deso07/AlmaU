import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import type { Achievement } from '../types/gamification';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  School as SchoolIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StudentDashboard: React.FC = () => {
  const { studentPoints } = useSelector((state: RootState) => state.gamification);
  const { analytics } = useSelector((state: RootState) => state.analytics);

  const progressToNextLevel = studentPoints
    ? ((studentPoints.totalPoints % 1000) / 1000) * 100
    : 0;

  const attendanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Attendance',
        data: analytics?.attendance
          ? [90, 85, 95, 88]
          : [0, 0, 0, 0],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Points and Level Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Progress
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrophyIcon sx={{ mr: 1 }} />
                <Typography variant="h4">
                  Level {studentPoints?.level || 1}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {studentPoints?.totalPoints || 0} points
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progressToNextLevel}
                sx={{ mt: 2 }}
              />
              <Typography variant="caption" color="text.secondary">
                {1000 - (studentPoints?.totalPoints || 0) % 1000} points to next level
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Achievements */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Achievements
              </Typography>
              <List>
                {studentPoints?.achievements.slice(0, 3).map((achievement: Achievement) => (
                  <ListItem key={achievement.id}>
                    <ListItemIcon>
                      <TrophyIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={achievement.title}
                      secondary={`+${achievement.points} points`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Analytics Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Analytics Overview
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <TimelineIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Attendance"
                    secondary={`${analytics?.attendance.percentage || 0}%`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <SchoolIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Current GPA"
                    secondary={analytics?.progress.currentGPA.toFixed(2) || '0.00'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <AssessmentIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Course Progress"
                    secondary={`${analytics?.progress.completedCourses || 0}/${analytics?.progress.totalCourses || 0} courses`}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Trend
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line
                  data={attendanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard; 