import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import type { LeaderboardEntry } from '../types/gamification';
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Box,
  Chip,
  Paper,
} from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

const Leaderboard: React.FC = () => {
  const { leaderboard } = useSelector((state: RootState) => state.gamification);

  const getMedalColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return 'transparent';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Student Leaderboard
        </Typography>
        <List>
          {leaderboard.map((student: LeaderboardEntry, index: number) => (
            <Paper
              key={student.userId}
              elevation={index < 3 ? 3 : 1}
              sx={{
                mb: 1,
                backgroundColor: index < 3 ? 'rgba(255, 255, 255, 0.9)' : 'white',
              }}
            >
              <ListItem>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: getMedalColor(student.rank),
                      color: index < 3 ? 'black' : 'white',
                    }}
                  >
                    {index < 3 ? <TrophyIcon /> : student.rank}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {student.username}
                      </Typography>
                      {index < 3 && (
                        <Chip
                          icon={<TrophyIcon />}
                          label={`${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : 'rd'}`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SchoolIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
                        <Typography variant="body2">
                          Level {student.level}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {student.totalPoints} points
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            </Paper>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default Leaderboard; 