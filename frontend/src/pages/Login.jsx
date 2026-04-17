import React, { useState } from 'react';
import { Shield, Lock, Hospital, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useSanjeevni } from '../context/SanjeevniContext';
import { useNavigate, Navigate } from 'react-router-dom';

const Login = () => {
  const { login, isAuthenticated, loading } = useSanjeevni();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hospital_id: 'H1',
    password: ''
  });
  const [error, setError] = useState('');

  if (isAuthenticated) return <Navigate to="/" />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.password) {
      setError('Please enter your access key');
      return;
    }

    const res = await login(formData);
    if (!res.success) {
      setError(res.error);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-hospital-sidebar flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sanjeevni-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-sanjeevni-500 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl shadow-sanjeevni-500/40 transform -rotate-6 hover:rotate-0 transition-transform">
            <Shield size={42} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Sanjeevni</h1>
          <p className="text-slate-400 mt-2 font-medium tracking-wide uppercase text-xs">Hospital Network OS</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white">Node Authentication</h2>
            <p className="text-slate-400 text-sm mt-1">Authorized health workers only.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Hospital size={14} /> Hospital Identifier
              </label>
              <select 
                value={formData.hospital_id}
                onChange={(e) => setFormData({...formData, hospital_id: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-sanjeevni-500/50 transition-all"
              >
                <option value="H1" className="bg-slate-900">H1 - Fortis Hospital Gurgaon</option>
                <option value="H2" className="bg-slate-900">H2 - Medanta - The Medicity</option>
                <option value="H3" className="bg-slate-900">H3 - Artemis Hospital</option>
                <option value="H4" className="bg-slate-900">H4 - Max Super Speciality Hospital</option>
                <option value="H5" className="bg-slate-900">H5 - CK Birla Hospital</option>
                <option value="H6" className="bg-slate-900">H6 - Alchemist Hospital</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                <Lock size={14} /> Access Key
              </label>
              <input 
                type="password" 
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-sanjeevni-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 text-rose-500 text-sm font-medium animate-in slide-in-from-top-2">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-sanjeevni-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sanjeevni-600 transition-all shadow-lg shadow-sanjeevni-500/20 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Enter Network <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-xs">
            System status: <span className="text-emerald-500 font-bold uppercase">Operations Normal</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
