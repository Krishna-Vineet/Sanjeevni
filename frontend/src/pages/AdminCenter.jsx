import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Activity, Hospital, ArrowUpRight, BarChart3, Users, Clock, Loader2 } from 'lucide-react';
import { useSanjeevni } from '../context/SanjeevniContext';
import { api } from '../services/api';

const AdminCenter = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const { activeTransfers, loading: contextLoading } = useSanjeevni();

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const hRes = await api.admin.getHospitals();
      setHospitals(hRes.data.hospitals);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            Admin Network Center <LayoutDashboard className="text-slate-400" size={28} />
          </h1>
          <p className="text-slate-500">System-wide monitoring and optimization for the Sanjeevni network</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-100 rounded-xl px-4 py-2 shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm font-bold text-slate-700">{hospitals.length} Active Nodes</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-sanjeevni-600 text-white border-0 flex flex-col justify-between p-8">
          <div className="flex justify-between items-start">
            <Activity size={32} className="opacity-50" />
            <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded-full">LIVE SCAN</span>
          </div>
          <div className="mt-8">
            <p className="text-sanjeevni-100 text-sm font-medium uppercase tracking-widest">Global Load Factor</p>
            <p className="text-5xl font-black mt-2">74%</p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-sanjeevni-200 text-sm font-bold">
            <ArrowUpRight size={18} /> +4.2% from last hour
          </div>
        </div>

        <div className="card flex flex-col justify-between p-8">
          <div className="flex justify-between items-start">
            <Clock size={32} className="text-slate-300" />
          </div>
          <div className="mt-8">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Avg. Transfer ETA</p>
            <p className="text-5xl font-black text-slate-800 mt-2">12.4m</p>
          </div>
          <div className="mt-6 text-emerald-600 text-sm font-bold">
            Optimized by AI Dispatcher
          </div>
        </div>

        <div className="card flex flex-col justify-between p-8">
          <div className="flex justify-between items-start">
            <Users size={32} className="text-slate-300" />
          </div>
          <div className="mt-8">
            <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Lives Saved (24h)</p>
            <p className="text-5xl font-black text-slate-800 mt-2">284</p>
          </div>
          <div className="mt-6 text-sanjeevni-600 text-sm font-bold">
            Network Efficiency: High
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Activity size={20} className="text-rose-500" /> Active System Transfers</h3>
            {contextLoading && <Loader2 size={16} className="animate-spin text-slate-400" />}
          </div>
          
          <div className="space-y-4">
            {activeTransfers.length === 0 ? (
              <p className="py-12 text-center text-slate-400 text-sm italic">No transfers in progress across the network.</p>
            ) : (
              activeTransfers.map((t) => (
                <div key={t.request_id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-sanjeevni-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                      t.status === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700 animate-pulse'
                    }`}>
                      {t.request_id.slice(-2)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{t.request_id}</p>
                      <p className="text-xs text-slate-500">Origin: H1 • Priority: <span className="text-rose-600 font-bold">{t.severity}</span></p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-bold uppercase tracking-widest ${t.status === 'accepted' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {t.status}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">{t.assigned_hospital || 'Matching...'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2"><Hospital size={20} className="text-sanjeevni-500" /> Hospital Node Status</h3>
          </div>
          
          <div className="space-y-6">
            {hospitals.map((h) => (
              <div key={h.id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{h.name}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{h.id}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    {h.icu_beds} Beds • <span className={h.load_factor > 0.7 ? 'text-rose-500' : 'text-emerald-500'}>{Math.round(h.load_factor * 100)}% Load</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${h.load_factor > 0.7 ? 'bg-rose-500' : 'bg-sanjeevni-500'}`} 
                    style={{ width: `${h.load_factor * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-slate-800 rounded-2xl text-white">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Network Insights</h4>
            <p className="text-sm font-medium leading-relaxed">
              H3 (Artemis Hospital) is nearing capacity. AI dispatcher is now prioritizing H4 (Max Super Speciality Hospital) for non-critical cases to balance network load.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminCenter;
