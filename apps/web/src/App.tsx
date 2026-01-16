import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import VolunteerDashboard from './pages/VolunteerDashboard';
import ParentDashboard from './pages/ParentDashboard';
import LearningHub from './pages/LearningHub';
import MyAssignments from './pages/MyAssignments';
import MyProgress from './pages/MyProgress';
import ClassRoster from './pages/ClassRoster';
import DeepAnalytics from './pages/DeepAnalytics';
import AssignmentSuite from './pages/AssignmentSuite';
import MessagingCenter from './pages/MessagingCenter';
import AIToolsPublic from './pages/AIToolsPublic';
import ProtectedRoute from './components/ProtectedRoute';

// Placeholder Client ID - User should replace with real one from Google Console
const GOOGLE_CLIENT_ID = "361795521130-loudg1rmrqkpgqu9dljb7nvej8tqn5hj.apps.googleusercontent.com";

const App: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <div className="min-h-screen bg-apollo-dark text-white font-sans selection:bg-apollo-indigo/30">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/ai-tools" element={<AIToolsPublic />} />

            {/* Protected Student Routes */}
            <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/hub" element={<ProtectedRoute allowedRoles={['student']}><LearningHub /></ProtectedRoute>} />
            <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><MyAssignments /></ProtectedRoute>} />
            <Route path="/student/progress" element={<ProtectedRoute allowedRoles={['student']}><MyProgress /></ProtectedRoute>} />

            <Route path="/teacher/dashboard" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/classes" element={<ProtectedRoute allowedRoles={['teacher']}><ClassRoster /></ProtectedRoute>} />
            <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={['teacher']}><AssignmentSuite /></ProtectedRoute>} />
            <Route path="/teacher/progress" element={<ProtectedRoute allowedRoles={['teacher']}><DeepAnalytics /></ProtectedRoute>} />

            {/* Protected Volunteer Routes */}
            <Route path="/volunteer/dashboard" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerDashboard /></ProtectedRoute>} />
            <Route path="/volunteer/messages" element={<ProtectedRoute allowedRoles={['volunteer']}><MessagingCenter /></ProtectedRoute>} />

            {/* Protected Parent Routes */}
            <Route path="/parent/dashboard" element={<ProtectedRoute allowedRoles={['parent']}><ParentDashboard /></ProtectedRoute>} />

            {/* Default Redirects */}
            <Route path="/unauthorized" element={
              <div className="flex items-center justify-center h-screen">
                <h1 className="text-2xl font-bold">403 - Unauthorized Access</h1>
              </div>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
