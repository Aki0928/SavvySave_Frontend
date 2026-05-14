import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        const checkAuth = async () => {
            const token = document.cookie.split('; ').find(row => row.startsWith('api_token='));
            if (token) {
                try {
                    const user = await api.getUser({ signal: controller.signal });
                    setUser(user);
                } catch (e) {
                    if (e.name !== 'AbortError') {
                        console.error('Auth check failed', e);
                        // Clear invalid token
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

    const login = async (email, password) => {
        try {
            const data = await api.login(email, password);

            // Store token in cookie
            document.cookie = `api_token=${data.api_token}; path=/; max-age=86400; SameSite=Lax`;

            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (name, email, password) => {
        try {
            const data = await api.register(name, email, password);

            // Store token in cookie
            document.cookie = `api_token=${data.api_token}; path=/; max-age=86400; SameSite=Lax`;

            setUser(data.user);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
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

export const useAuth = () => useContext(AuthContext);
