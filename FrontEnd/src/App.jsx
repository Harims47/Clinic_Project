import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PatientListPage from './features/patients/pages/PatientListPage.jsx';
import ProductListPage from './features/products/pages/ProductListPage.jsx';
import QueueDashboardPage from './features/tokens/pages/QueueDashboardPage.jsx';
import SalesBillingPage from './features/sales/pages/SalesBillingPage.jsx';
import InvoiceListPage from './features/sales/pages/InvoiceListPage.jsx';

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Protected route middleware guard
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public login route */}
            <Route path="/login" element={<Login />} />

            {/* Secure dashboard routes layout */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="patients" element={<PatientListPage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="tokens" element={<QueueDashboardPage />} />
              <Route path="sales" element={<SalesBillingPage />} />
              <Route path="invoices" element={<InvoiceListPage />} />
            </Route>

            {/* Redirection fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
