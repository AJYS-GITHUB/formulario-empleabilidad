'use client';

import { AuthProvider } from '../contexts/AuthContext';
import ProtectedAdminDashboard from '../components/ProtectedAdminDashboard';

export default function AdminPage() {
  return (
    <AuthProvider>
      <ProtectedAdminDashboard />
    </AuthProvider>
  );
}