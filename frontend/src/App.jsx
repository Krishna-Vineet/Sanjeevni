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
import Analytics from './pages/Analytics'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

// Notification Toast Component
const NotificationToast = () => {
  const { notifications } = useSanjeevni();
  
  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 w-80">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl ${
              n.type === 'success' ? 'bg-emerald-500/90 text-white border-emerald-400' :
              n.type === 'error' ? 'bg-rose-500/90 text-white border-rose-400' :
              'bg-slate-800/90 text-white border-slate-700'
            }`}
          >
            {n.type === 'success' ? <CheckCircle size={20} /> :
             n.type === 'error' ? <AlertCircle size={20} /> :
             <Info size={20} />}
            <p className="text-sm font-bold flex-1">{n.message}</p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

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

function App() {
  return (
    <Router>
      <SanjeevniProvider>
        <NotificationToast />
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
                      <Route path="/analytics" element={<Analytics />} />
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
