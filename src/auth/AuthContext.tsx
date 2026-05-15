import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, User, LoginResponse, RegisterResponse } from '../services/api';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    loading: boolean;
}

interface AuthProviderProps {
    children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const controller = new AbortController();
        
        const checkAuth = async () => {
            const token = document.cookie.split('; ').find(row => row.startsWith('api_token='));
            
            if (token) {
                try {
                    const userData = await api.getUser<User>({ signal: controller.signal });
                    setUser(userData);
                } catch (e) {
                    if (e instanceof Error && e.name !== 'AbortError') {
                        console.error('Auth check failed', e);
                        document.cookie = 'api_token=; path=/; max-age=0';
                    }
                }
            }
            
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        };
        
        checkAuth();
        return () => controller.abort();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const data = await api.login<LoginResponse>(email, password);
            document.cookie = `api_token=${data.api_token}; path=/; max-age=86400; SameSite=Lax`;
            setUser(data.user);
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            return { success: false, error: errorMessage };
        }
    };

    const register = async (name: string, email: string, password: string) => {
        try {
            const data = await api.register<RegisterResponse>(name, email, password);
            document.cookie = `api_token=${data.api_token}; path=/; max-age=86400; SameSite=Lax`;
            setUser(data.user);
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed';
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (e) {
            console.error('Logout failed', e);
        } finally {
            document.cookie = 'api_token=; path=/; max-age=0';
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    
    return context;
};