import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const SanjeevniContext = createContext();

export const SanjeevniProvider = ({ children }) => {
  const [hospitalInfo, setHospitalInfo] = useState({
    id: 'H1',
    name: 'Sanjeevni Central',
    icu_beds: 5,
    general_beds: 20,
  });

  const [activeTransfers, setActiveTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('sanjeevni_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('sanjeevni_token'));

  useEffect(() => {
    const savedHospital = localStorage.getItem('sanjeevni_hospital');
    if (savedHospital) {
      setHospitalInfo(JSON.parse(savedHospital));
    }
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    try {
      const res = await api.auth.login(credentials);
      const { token, hospital } = res.data;
      
      setToken(token);
      setIsAuthenticated(true);
      setHospitalInfo(hospital);
      
      localStorage.setItem('sanjeevni_token', token);
      localStorage.setItem('sanjeevni_hospital', JSON.stringify(hospital));
      
      return { success: true };
    } catch (err) {
      console.error("Login failed", err);
      return { success: false, error: "Invalid credentials" };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.auth.logout();
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setToken(null);
      setIsAuthenticated(false);
      localStorage.removeItem('sanjeevni_token');
      localStorage.removeItem('sanjeevni_hospital');
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.admin.getTransfers();
      setActiveTransfers(res.data.transfers);
    } catch (err) {
      console.error("Failed to refresh data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <SanjeevniContext.Provider value={{ 
      hospitalInfo, 
      activeTransfers, 
      loading, 
      isAuthenticated,
      login,
      logout,
      refreshData,
      setHospitalInfo 
    }}>
      {children}
    </SanjeevniContext.Provider>
  );
};

export const useSanjeevni = () => {
  const context = useContext(SanjeevniContext);
  if (!context) throw new Error("useSanjeevni must be used within SanjeevniProvider");
  return context;
};
