import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const SanjeevniContext = createContext();

export const SanjeevniProvider = ({ children }) => {
  const [hospitalInfo, setHospitalInfo] = useState(() => {
    const saved = localStorage.getItem('sanjeevni_hospital');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTransfers, setActiveTransfers] = useState([]);
  const [resourceRequests, setResourceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  
  // Auth State
  const [token, setToken] = useState(localStorage.getItem('sanjeevni_token'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('sanjeevni_token'));

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
      
      addNotification(`Access Granted: ${hospital.name}`, 'success');
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials. Access Denied.";
      addNotification(msg, 'error');
      return { success: false, error: msg };
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
      setHospitalInfo(null);
      localStorage.removeItem('sanjeevni_token');
      localStorage.removeItem('sanjeevni_hospital');
      setLoading(false);
      addNotification("Logged out of Sanjeevni Network", 'info');
    }
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    try {
      // 1. Fetch Patient Transfers
      const res = await api.hospital.getRequests();
      const currentRequests = res.data.requests || [];
      
      currentRequests.forEach(req => {
        const existing = activeTransfers.find(et => et.request_id === req.request_id);
        if (!existing && req.severity === 'critical') {
          addNotification(`CRITICAL: New Code Red Broadcast received!`, 'warning');
        }
      });
      setActiveTransfers(currentRequests);

      // 2. Fetch Resource Exchanges
      const resourceRes = await api.resource.getAll();
      setResourceRequests(resourceRes.data.requests || []);
    } catch (err) {
      console.error("Failed to refresh network data", err);
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
      resourceRequests,
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
