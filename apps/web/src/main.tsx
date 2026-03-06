import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import './index.css';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Documents from './pages/Documents';
import Chat from './pages/Chat';
import Settings from './pages/Settings';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster theme="dark" position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
