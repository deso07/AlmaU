import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Feedback, Analytics } from '../../types/gamification';

interface AnalyticsState {
  feedback: Feedback[];
  analytics: Analytics | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  feedback: [],
  analytics: null,
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setFeedback: (state, action: PayloadAction<Feedback[]>) => {
      state.feedback = action.payload;
    },
    addFeedback: (state, action: PayloadAction<Feedback>) => {
      state.feedback.push(action.payload);
    },
    setAnalytics: (state, action: PayloadAction<Analytics>) => {
      state.analytics = action.payload;
    },
    updateAttendance: (state, action: PayloadAction<Analytics['attendance']>) => {
      if (state.analytics) {
        state.analytics.attendance = action.payload;
      }
    },
    updateGrades: (state, action: PayloadAction<Analytics['grades']>) => {
      if (state.analytics) {
        state.analytics.grades = action.payload;
      }
    },
    updateProgress: (state, action: PayloadAction<Analytics['progress']>) => {
      if (state.analytics) {
        state.analytics.progress = action.payload;
      }
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
  setFeedback,
  addFeedback,
  setAnalytics,
  updateAttendance,
  updateGrades,
  updateProgress,
  setLoading,
  setError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer; 