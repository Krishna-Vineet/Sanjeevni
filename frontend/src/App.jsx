import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SanjeevniProvider, useSanjeevni } from './context/SanjeevniContext'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import TransferRequest from './pages/TransferRequest'
import ResourceExchange from './pages/ResourceExchange'
import SmartDoctor from './pages/SmartDoctor'
import AdminCenter from './pages/AdminCenter'
import HospitalSettings from './pages/HospitalSettings'
import Login from './pages/Login'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSanjeevni();
  
  if (loading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-hospital-sidebar flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sanjeevni-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Placeholder components for other pages
const Placeholder = ({ name }) => (
  <div className="flex flex-col items-center justify-center h-[80vh] text-slate-400">
    <h2 className="text-2xl font-bold mb-2">{name}</h2>
    <p>This module is coded and ready for further feature development.</p>
  </div>
);

function App() {
  return (
    <Router>
      <SanjeevniProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex bg-hospital-bg min-h-screen font-sans antialiased text-slate-800">
                <Sidebar />
                
                <main className="flex-1 ml-64 p-8">
                  <div className="max-w-7xl mx-auto">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/transfer" element={<TransferRequest />} />
                      <Route path="/resources" element={<ResourceExchange />} />
                      <Route path="/ai" element={<SmartDoctor />} />
                      <Route path="/admin" element={<AdminCenter />} />
                      <Route path="/analytics" element={<Placeholder name="System Analytics" />} />
                      <Route path="/settings" element={<HospitalSettings />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </SanjeevniProvider>
    </Router>
  )
}

export default App
