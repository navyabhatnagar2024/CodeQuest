import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { GamificationProvider } from './contexts/GamificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import ProblemDetail from './pages/ProblemDetail';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetail';
import Leaderboard from './pages/Leaderboard';
import Submissions from './pages/Submissions';
import Profile from './pages/Profile';
import CodeGames from './pages/CodeGames';
import StudyGroups from './pages/StudyGroups';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProblems from './pages/admin/Problems';
import AdminContests from './pages/admin/Contests';
import AdminUsers from './pages/admin/Users';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <Layout>
                <Practice />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/code-games"
          element={
            <ProtectedRoute>
              <Layout>
                <CodeGames />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/study-groups"
          element={
            <ProtectedRoute>
              <Layout>
                <StudyGroups />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/problems/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ProblemDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contests"
          element={
            <ProtectedRoute>
              <Layout>
                <Contests />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contests/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <ContestDetail />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/leaderboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Leaderboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/submissions"
          element={
            <ProtectedRoute>
              <Layout>
                <Submissions />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <AdminRoute>
              <Layout>
                <AdminProblems />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/contests"
          element={
            <AdminRoute>
              <Layout>
                <AdminContests />
              </Layout>
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <Layout>
                <AdminUsers />
              </Layout>
            </AdminRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <GamificationProvider>
        <AppRoutes />
      </GamificationProvider>
    </AuthProvider>
  );
};

export default App;
