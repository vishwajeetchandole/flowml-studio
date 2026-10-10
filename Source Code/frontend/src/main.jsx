import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/globals.css';
import './index.css';

// Context
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';

// Pages
import LandingPage from './pages/LandingPage.jsx';
import App from './App.jsx';

// Auth Pages
import SignIn from './pages/auth/SignIn.jsx';
import SignUp from './pages/auth/SignUp.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import VerifyEmail from './pages/auth/VerifyEmail.jsx';

// Dashboard Pages
import DashboardLayout from './pages/dashboard/DashboardLayout.jsx';
import ProjectsView from './pages/dashboard/ProjectsView.jsx';
import DatasetsView from './pages/dashboard/DatasetsView.jsx';
import ModelsView from './pages/dashboard/ModelsView.jsx';
import RunsView from './pages/dashboard/RunsView.jsx';
import TemplatesView from './pages/dashboard/TemplatesView.jsx';
import CodeEditorView from './pages/dashboard/CodeEditorView.jsx';
import AdminView from './pages/dashboard/AdminView.jsx';
import SettingsView from './pages/dashboard/SettingsView.jsx';

// Info & Legal Pages
import {
  DocsPage,
  TutorialsPage,
  AboutPage,
  ContactPage,
  PrivacyPage,
  TermsPage
} from './pages/info/InfoPages.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Landing & Info */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Authentication */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Protected Dashboard */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProjectsView />} />
            <Route path="projects" element={<ProjectsView />} />
            <Route path="datasets" element={<DatasetsView />} />
            <Route path="models" element={<ModelsView />} />
            <Route path="runs" element={<RunsView />} />
            <Route path="code" element={<CodeEditorView />} />
            <Route path="templates" element={<TemplatesView />} />
            <Route path="admin" element={<AdminView />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>

          {/* Protected Studio */}
          <Route
            path="/studio"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio/*"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
