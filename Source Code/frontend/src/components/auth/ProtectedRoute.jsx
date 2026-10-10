import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Cpu, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center"
        style={{ background: 'var(--color-bg)' }}
      >
        <div className="relative flex items-center justify-center mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl relative"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
          >
            <Cpu className="w-7 h-7 text-white animate-pulse" />
          </div>
          <div
            className="absolute -inset-2 rounded-3xl blur-xl opacity-40 animate-pulse"
            style={{ background: '#6366f1' }}
          />
        </div>
        <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Authenticating FlowML workspace…
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}
