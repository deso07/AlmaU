import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

// Layout
import Layout from '../components/layout/Layout';

// Pages
import Dashboard from '../pages/Dashboard';
import Tasks from '../pages/Tasks';
import Schedule from '../pages/Schedule';
import Materials from '../pages/Materials';
import CampusMap from '../pages/CampusMap';
import JobBoard from '../pages/JobBoard';
import Events from '../pages/Events';
import Chat from '../pages/Chat';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
// New pages
import FAQ from '../pages/FAQ';
import GradesJournal from '../pages/GradesJournal';
import TeacherProfile from '../pages/TeacherProfile';
import AdditionalCourses from '../pages/AdditionalCourses';
import TeacherCourses from '../pages/TeacherCourses';
import Announcements from '../pages/Announcements';
import StudentGrades from '../pages/StudentGrades';

// Auth-protected Route component
const ProtectedRoute: React.FC<{element: JSX.Element}> = ({ element }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  // If we're still checking authentication status, show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }
  
  // If user is authenticated, render the requested page, otherwise redirect to login
  return isAuthenticated ? element : <Navigate to="/login" replace />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <Register />} 
      />
      <Route 
        path="/forgot-password" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />} 
      />
      
      {/* Protected routes wrapped in Layout */}
      <Route path="/" element={<ProtectedRoute element={<Layout />} />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="materials" element={<Materials />} />
        <Route path="campus-map" element={<CampusMap />} />
        <Route path="jobs" element={<JobBoard />} />
        <Route path="events" element={<Events />} />
        <Route path="chat" element={<Chat />} />
        <Route path="settings" element={<Settings />} />
        {/* New routes */}
        <Route path="faq" element={<FAQ />} />
        <Route path="grades" element={<GradesJournal />} />
        <Route path="teacher-profile" element={<TeacherProfile />} />
        <Route path="teacher-courses" element={<TeacherCourses />} />
        <Route
          path="/additional-courses"
          element={
            <ProtectedRoute element={<AdditionalCourses />} />
          }
        />
        <Route path="announcements" element={<Announcements />} />
        <Route path="student-grades" element={<StudentGrades />} />
        
        {/* Redirect any unmatched routes to Dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
