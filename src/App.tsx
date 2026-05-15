import React from 'react';
import type { ReactNode } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import { AuthProvider, useAuth } from './auth/AuthContext';
import { SnackbarProvider } from './components/SnackbarContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddSaving from './pages/AddSaving';
import Analysis from './pages/Analysis';
import Categories from './pages/Categories';
import UserManagement from './pages/UserManagement';
import AILab from './pages/AILab';
import LandingPage from './pages/LandingPage';
import Profile from './pages/Profile';

// ============ TYPES ============
interface User {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
    is_active?: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    loading: boolean;
}

interface ProtectedRouteProps {
    children: ReactNode;
}

// ============ PROTECTED ROUTE COMPONENT ============
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const auth = useAuth() as AuthContextType;
    const { user } = auth;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Layout>{children}</Layout>;
};

// ============ MAIN APP COMPONENT ============
const App = () => {
    return (
        <Router>
            <SnackbarProvider>
                <AuthProvider>
                    {/* Main app container with Tailwind classes */}
                    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            
                            {/* Protected Routes (require authentication) */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/add"
                                element={
                                    <ProtectedRoute>
                                        <AddSaving />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/analysis"
                                element={
                                    <ProtectedRoute>
                                        <Analysis />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/categories"
                                element={
                                    <ProtectedRoute>
                                        <Categories />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/users"
                                element={
                                    <ProtectedRoute>
                                        <UserManagement />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/profile"
                                element={
                                    <ProtectedRoute>
                                        <Profile />
                                    </ProtectedRoute>
                                }
                            />

                            <Route
                                path="/ai-lab"
                                element={
                                    <ProtectedRoute>
                                        <AILab />
                                    </ProtectedRoute>
                                }
                            />

                            {/* Catch all - 404 redirect to home */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </div>
                </AuthProvider>
            </SnackbarProvider>
        </Router>
    );
};

export default App;