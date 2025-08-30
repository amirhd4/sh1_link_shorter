// frontend/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // <--- State برای لود اولیه

    const checkUserStatus = useCallback(async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const userResponse = await api.get('/auth/users/me');
                setUser(userResponse.data);
            } catch (error) {
                console.error("Invalid token, logging out.");
                localStorage.removeItem('accessToken');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const refreshUser = async () => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const userResponse = await api.get('/auth/users/me');
                setUser(userResponse.data);
            } catch (error) {
                // در صورت خطا، کاربر را logout می‌کنیم
                logout();
            }
        }
    };

    useEffect(() => {
        checkUserStatus();
    }, [checkUserStatus]);

    const login = async (email, password) => {
        const response = await api.post('/auth/token', new URLSearchParams({
            username: email,
            password: password,
        }));
        localStorage.setItem('accessToken', response.data.access_token);
        await checkUserStatus();
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    const authContextValue = { user, loading, login, logout, refreshUser };

    if (loading) {
        return <div>Loading Application...</div>;
    }

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};