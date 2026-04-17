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
  const [notifications, setNotifications] = useState([]);
  
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('sanjeevni_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('sanjeevni_token'));

  useEffect(() => {
    const savedHospital = localStorage.getItem('sanjeevni_hospital');
    if (savedHospital) {
      setHospitalInfo(JSON.parse(savedHospital));
    }
  }, []);

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

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
      
      addNotification(`Welcome, ${hospital.name}`, 'success');
      return { success: true };
    } catch (err) {
      console.error("Login failed", err);
      addNotification("Login failed. Check credentials.", 'error');
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
      addNotification("Signed out safely", 'info');
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.admin.getTransfers();
      
      // Notify if a new transfer is accepted compared to current state
      res.data.transfers.forEach(t => {
        const existing = activeTransfers.find(et => et.request_id === t.request_id);
        if (t.status === 'accepted' && (!existing || existing.status !== 'accepted')) {
          addNotification(`Transfer ${t.request_id} has been ACCEPTED!`, 'success');
        }
      });

      setActiveTransfers(res.data.transfers);
    } catch (err) {
      console.error("Failed to refresh data", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
      const interval = setInterval(refreshData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTransfers]); // Added activeTransfers to comparison logic

  return (
    <SanjeevniContext.Provider value={{ 
      hospitalInfo, 
      activeTransfers, 
      loading, 
      isAuthenticated,
      notifications,
      addNotification,
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
