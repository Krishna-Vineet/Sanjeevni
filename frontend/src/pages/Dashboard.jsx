import React, { useState, useEffect } from 'react';
import { Activity, Users, Battery, AlertTriangle, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { useSanjeevni } from '../context/SanjeevniContext';
import { api } from '../services/api';

const StatCard = ({ icon: Icon, label, value, trend, color, loading }) => (
  <div className="card flex flex-col gap-4 relative overflow-hidden">
    {loading && <div className="absolute inset-0 bg-white/40 animate-pulse"></div>}
    <div className="flex items-center justify-between">
      <div className={`p-2 rounded-lg bg-${color}-50 text-${color}-500`}>
        <Icon size={24} />
      </div>
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
        {trend > 0 ? '+' : ''}{trend}%
      </span>
    </div>
    <div>
      <p className="text-slate-500 text-sm">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { hospitalInfo, activeTransfers, refreshData } = useSanjeevni();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchIncoming();
    const interval = setInterval(fetchIncoming, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncoming = async () => {
    try {
      const res = await api.hospital.getRequests(hospitalInfo.id);
      // Filter only "broadcasted" ones where we haven't responded yet (simulated)
      setIncomingRequests(res.data.requests.filter(r => r.status === 'broadcasted'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleResponse = async (requestId, response) => {
    setProcessingId(requestId);
    try {
      await api.hospital.respond({
        request_id: requestId,
        hospital_id: hospitalInfo.id,
        response
      });
      await refreshData();
      await fetchIncoming();
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Hospital Dashboard</h1>
          <p className="text-slate-500">Real-time capacity and resource monitoring for <b>{hospitalInfo.name}</b></p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-end">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">System Status</span>
            <div className="flex items-center gap-2 text-emerald-500 font-medium">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              All Nodes Online
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Activity} label="ICU Bed Availability" value={`${hospitalInfo.icu_beds} / 12`} trend={-8} color="sanjeevni" />
        <StatCard icon={Users} label="Total Admitted" value="142" trend={12} color="blue" />
        <StatCard icon={Battery} label="Oxygen Supply" value="82%" trend={-2} color="amber" />
        <StatCard icon={AlertTriangle} label="Emergency Index" value="High" trend={5} color="rose" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Live Incoming Requests</h3>
              <span className="bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Live</span>
            </div>
            
            <div className="space-y-4">
              {incomingRequests.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  <Activity size={32} className="opacity-20" />
                  <p className="text-sm font-medium">No incoming emergency requests at the moment.</p>
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <div key={req.request_id} className="flex items-center justify-between p-5 bg-slate-50 rounded-xl border border-slate-200 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center font-bold">
                        <ShieldAlert size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 uppercase text-sm tracking-tight">Code Red: {req.severity}</p>
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold">{req.request_id}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">{req.condition}</p>
                        <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Needs: {req.required_resources.join(', ')}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      {processingId === req.request_id ? (
                        <div className="flex items-center gap-2 text-sanjeevni-600 font-bold px-4">
                          <Loader2 size={18} className="animate-spin" /> Processing
                        </div>
                      ) : (
                        <>
                          <button 
                            onClick={() => handleResponse(req.request_id, 'reject')}
                            className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <X size={20} />
                          </button>
                          <button 
                            onClick={() => handleResponse(req.request_id, 'accept')}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                          >
                            <Check size={20} /> Accept
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">ML Surge Prediction</h3>
            <div className="h-64 bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 p-8 text-center">
               <div className="relative w-full h-32 overflow-hidden mb-4 opacity-30">
                  <div className="absolute inset-0 flex items-end justify-between px-4">
                    {[40, 60, 45, 80, 50, 90, 70, 85].map((h, i) => (
                      <div key={i} className="w-8 bg-sanjeevni-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
               </div>
              <p className="text-slate-500 font-medium">Predicted Surge: <span className="text-emerald-600">+22% in next 6h</span></p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">AI analysis based on historical trend and nearby hospital occupancy. Pre-emptive resource allocation recommended.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-sanjeevni-900 text-white border-0 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full"></div>
            <h3 className="text-lg font-bold mb-2">Inventory Advisor (ML)</h3>
            <p className="text-sanjeevni-200 text-sm mb-6">Based on predicted surge, your hospital might face an Oxygen shortage.</p>
            <div className="space-y-4">
              <div className="bg-white/10 p-4 rounded-xl border border-white/10 group hover:bg-white/15 transition-all cursor-pointer">
                <p className="text-xs text-sanjeevni-300 font-medium uppercase mb-1">Critical Insight</p>
                <p className="font-medium text-white mb-3 leading-tight">Request 20 Oxygen Cylinders from Metro Health (Surplus detected)</p>
                <div className="flex items-center gap-2 text-sanjeevni-400 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
                  Run Resource Bot <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Network Overview</h3>
            <div className="space-y-4">
              {activeTransfers.slice(0, 3).map((t) => (
                <div key={t.request_id} className="flex flex-col gap-1 py-1">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700 font-medium">{t.request_id}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      t.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                    <div className={`h-full transition-all duration-1000 ${t.status === 'accepted' ? 'w-full bg-emerald-500' : 'w-1/2 bg-amber-500 animate-pulse'}`}></div>
                  </div>
                </div>
              ))}
              {activeTransfers.length === 0 && <p className="text-xs text-slate-400 italic">No network activity</p>}
              <button className="w-full mt-2 py-2 text-xs font-bold text-sanjeevni-600 uppercase tracking-widest hover:bg-sanjeevni-50 rounded-lg transition-all">
                View Full Network Log
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
