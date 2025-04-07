import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StudentPoints, Achievement, LeaderboardEntry, Activity } from '../../types/gamification';

interface GamificationState {
  studentPoints: StudentPoints | null;
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GamificationState = {
  studentPoints: null,
  leaderboard: [],
  isLoading: false,
  error: null,
};

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    setStudentPoints: (state, action: PayloadAction<StudentPoints>) => {
      state.studentPoints = action.payload;
    },
    addPoints: (state, action: PayloadAction<{ points: number; activity: Activity }>) => {
      if (state.studentPoints) {
        state.studentPoints.totalPoints += action.payload.points;
        state.studentPoints.recentActivities.unshift(action.payload.activity);
        // Calculate level based on points (every 1000 points = 1 level)
        state.studentPoints.level = Math.floor(state.studentPoints.totalPoints / 1000) + 1;
      }
    },
    unlockAchievement: (state, action: PayloadAction<Achievement>) => {
      if (state.studentPoints) {
        state.studentPoints.achievements.push({
          ...action.payload,
          unlockedAt: new Date(),
        });
      }
    },
    setLeaderboard: (state, action: PayloadAction<LeaderboardEntry[]>) => {
      state.leaderboard = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setStudentPoints,
  addPoints,
  unlockAchievement,
  setLeaderboard,
  setLoading,
  setError,
} = gamificationSlice.actions;

export default gamificationSlice.reducer; 