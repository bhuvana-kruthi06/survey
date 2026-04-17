import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/LoginPage";
import SurveyCategories from "./pages/SurveyCategories";
import SurveyPage from "./pages/SurveyPage";
import SurveyBuilder from "./pages/SurveyBuilder";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/surveys" element={
        <ProtectedRoute><AppLayout><SurveyCategories user={user} /></AppLayout></ProtectedRoute>
      }/>
      <Route path="/survey/:id" element={
        <ProtectedRoute><AppLayout><SurveyPage /></AppLayout></ProtectedRoute>
      }/>
      <Route path="/builder" element={
        <ProtectedRoute><AppLayout><SurveyBuilder /></AppLayout></ProtectedRoute>
      }/>
      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      }/>
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