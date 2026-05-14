import React from 'react';
import type { ReactNode } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
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

interface AuthUser {
    id?: string | number;
    name?: string;
    email?: string;
    is_admin?: boolean;
    is_active?: boolean;
}

interface AuthContextValue {
    user?: AuthUser | null;
}

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const auth = useAuth() as unknown as AuthContextValue;
    const user = auth?.user;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Layout>{children}</Layout>;
};

const App = () => {
    return (
        <Router>
            <SnackbarProvider>
                <AuthProvider>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />

                        <Route path="/login" element={<Login />} />

                        <Route path="/register" element={<Register />} />

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

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AuthProvider>
            </SnackbarProvider>
        </Router>
    );
};

export default App;