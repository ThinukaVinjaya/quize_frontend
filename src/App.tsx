import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { PublicQuizJoinPage } from './pages/public/PublicQuizJoinPage.js';
import { StudentLayout } from './layouts/StudentLayout.js';
import { AdminLayout } from './layouts/AdminLayout.js';

import { StudentDashboardPage } from './pages/student/StudentDashboardPage.js';
import { QuizExamPage } from './pages/student/QuizExamPage.js';
import { StudentResultPage } from './pages/student/StudentResultPage.js';
import { StudentAnalyticsPage } from './pages/student/StudentAnalyticsPage.js';
import { StudentProfilePage } from './pages/student/StudentProfilePage.js';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage.js';
import { AdminQuizListPage } from './pages/admin/AdminQuizListPage.js';
import { AdminQuizEditorPage } from './pages/admin/AdminQuizEditorPage.js';
import { AdminPdfImportPage } from './pages/admin/AdminPdfImportPage.js';
import { AdminQuizReportPage } from './pages/admin/AdminQuizReportPage.js';
import { AdminProfilePage } from './pages/admin/AdminProfilePage.js';

const ProtectedRoute: React.FC<{ children: React.ReactElement; requiredRole?: 'ADMIN' | 'STUDENT' }> = ({
  children,
  requiredRole,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 gap-3 font-sans">
        <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold">Loading examination portal...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

export const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Auth & Public Share Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/quiz/:quizId" element={<PublicQuizJoinPage />} />

      {/* Student Protected Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<StudentDashboardPage />} />
        <Route path="analytics" element={<StudentAnalyticsPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
        <Route path="results/:resultId" element={<StudentResultPage />} />
      </Route>

      {/* Standalone Distraction-free Exam View */}
      <Route
        path="/student/quiz/:quizId/take"
        element={
          <ProtectedRoute requiredRole="STUDENT">
            <QuizExamPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="quizzes" element={<AdminQuizListPage />} />
        <Route path="quizzes/create" element={<AdminQuizEditorPage />} />
        <Route path="pdf-import" element={<AdminPdfImportPage />} />
        <Route path="quizzes/:quizId/report" element={<AdminQuizReportPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
