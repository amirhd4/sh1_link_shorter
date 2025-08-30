import React, { createContext, useState, useContext } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        const response = await api.post('/auth/token', new URLSearchParams({
            username: email,
            password: password,
        }));
        localStorage.setItem('accessToken', response.data.access_token);
        const userResponse = await api.get('/auth/users/me');
        setUser(userResponse.data);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    const authContextValue = { user, login, logout };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};