import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token header settings in Axios
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Parse basic payload context from JWT
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          userId: payload.userId,
          username: payload.username,
          role: payload.role
        });
      } catch (err) {
        logout();
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { data } = response.data;
      const newToken = data.token;

      // Set Axios auth header immediately to prevent network race conditions
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      localStorage.setItem('token', newToken);

      // Parse payload context from JWT and set User state synchronously
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      const userSession = {
        userId: payload.userId,
        username: payload.username,
        role: payload.role
      };

      setUser(userSession);
      setToken(newToken);

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login request failed';
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
