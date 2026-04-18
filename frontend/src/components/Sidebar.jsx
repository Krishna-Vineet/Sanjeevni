import React from 'react';
import { Home, Send, RefreshCw, MessageSquare, ShieldAlert, BarChart3, Settings, LogOut, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSanjeevni } from '../context/SanjeevniContext';

const Sidebar = () => {
  const location = useLocation();
  const { hospitalInfo, logout } = useSanjeevni();
  
  const menuItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/' },
    { icon: <Send size={20} />, label: 'Transfer Request', path: '/transfer' },
    { icon: <RefreshCw size={20} />, label: 'Resource Exchange', path: '/resources' },
    { icon: <MessageSquare size={20} />, label: 'Smart Doctor', path: '/ai' },
    { icon: <Package size={20} />, label: 'Fleet Inventory', path: '/inventory' },
  ];

  return (
    <div className="w-64 bg-hospital-sidebar h-screen text-slate-300 fixed flex flex-col border-r border-slate-800 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg overflow-hidden shadow-lg shadow-sanjeevni-500/20 shrink-0">
          <img src="/icon.png" alt="Sanjeevni" className="w-full h-full object-cover" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Sanjeevni</span>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-sanjeevni-500/10 text-sanjeevni-400 font-bold border border-sanjeevni-500/20 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.05)]' 
                  : 'hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800 space-y-2">
        <Link 
          to="/settings" 
          className={`flex items-center justify-between p-3 rounded-xl transition-all ${
            location.pathname === '/settings' 
              ? 'bg-slate-800 text-white font-bold' 
              : 'text-slate-500 hover:text-white hover:bg-slate-800/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings size={18} />
            <span className="text-sm">Hospital Settings</span>
          </div>
        </Link>
        
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active Node</p>
          </div>
          <p className="text-sm font-bold text-white truncate">
            {hospitalInfo?.name || "Initializing..."}
          </p>
          <button 
            onClick={logout}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all"
          >
            <LogOut size={14} /> System Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
