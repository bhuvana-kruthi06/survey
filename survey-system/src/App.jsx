import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import SurveyCategories from "./pages/SurveyCategories";
import SurveyPage from "./pages/SurveyPage";
import SurveyBuilder from "./pages/SurveyBuilder";
import Dashboard from "./pages/Dashboard";

// Admin Portal Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import SurveyManagement from "./pages/admin/SurveyManagement";
import ResponseAnalytics from "./pages/admin/ResponseAnalytics";
import AdminProfile from "./pages/admin/AdminProfile";

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* ── Public / Respondent Routes ── */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/surveys"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SurveyCategories user={user} />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/survey/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SurveyPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/builder"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SurveyBuilder />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* ── Dedicated Admin Authentication ── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Protected Admin Portal ── */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="surveys" element={<SurveyManagement />} />
        <Route path="analytics" element={<ResponseAnalytics />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}