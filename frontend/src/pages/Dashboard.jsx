import React, { useState, useEffect } from 'react';
import { Activity, Users, Battery, AlertTriangle, Check, X, ArrowRight, Loader2, ShieldAlert, ShieldCheck, Plus, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const { hospitalInfo, activeTransfers, resourceRequests, refreshData } = useSanjeevni();
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [broadcasting, setBroadcasting] = useState(false);

  useEffect(() => {
    fetchIncoming();
    fetchNews();
    const interval = setInterval(() => {
      fetchIncoming();
      fetchNews();
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncoming = async () => {
    try {
      const res = await api.hospital.getRequests();
      setIncomingRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNews = async () => {
    try {
      const res = await api.news.latest();
      setNews(res.data.news || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastNews = async (e) => {
    e.preventDefault();
    if(!newsTitle || !newsContent) return;
    setBroadcasting(true);
    try {
        await api.news.broadcast({ title: newsTitle, content: newsContent });
        setNewsTitle('');
        setNewsContent('');
        setShowNewsForm(false);
        fetchNews();
    } catch (err) {
        console.error("Broadcast failed", err);
    } finally {
        setBroadcasting(false);
    }
  };

  const handleResponse = async (requestId, response) => {
    setProcessingId(requestId);
    try {
      await api.hospital.respond({
        request_id: requestId,
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

  if (!hospitalInfo) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Fleet Command</h1>
          <p className="text-slate-500 font-medium">Monitoring Node: <b className="text-slate-900 font-black uppercase text-xs">{hospitalInfo.name} ({hospitalInfo.hospital_id})</b></p>
        </div>
        <div className="flex gap-3">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Uplink Status</span>
            <div className="flex items-center gap-2 text-emerald-500 font-black uppercase text-[10px] tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></span>
              Synchronized
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Activity} label="Critical Capacity" value={`${hospitalInfo.icu_beds} Beds`} trend={-4} color="sanjeevni" />
        <StatCard icon={Users} label="Active Transfers" value={activeTransfers.length} trend={+15} color="blue" />
        <StatCard icon={Battery} label="O2 Supplies" value={`${hospitalInfo?.oxygen_units} units`} trend={+2} color="amber" />
        <StatCard icon={ShieldCheck} label="Network Trust Score" value={`${hospitalInfo?.trust_score || 0}%`} trend={+5} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-white shadow-xl shadow-slate-200/50 border-none rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase">Code Red Priority Feed</h3>
              </div>
              <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Live Scan</span>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {incomingRequests.length === 0 ? (
                <div className="py-20 flex flex-col items-center gap-4 text-slate-300 border-2 border-dashed border-slate-100 rounded-3xl">
                  <Activity size={48} className="opacity-10" />
                  <p className="text-xs font-black uppercase tracking-[0.3em]">No Broadcasts Detected</p>
                </div>
              ) : (
                incomingRequests.map((req) => (
                  <div key={req.request_id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-rose-200 transition-all group shadow-sm">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 transform group-hover:rotate-3 transition-transform">
                        <ShieldAlert size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-slate-900 uppercase text-xs tracking-widest">Code Red: {req.severity}</p>
                          <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-bold">{req.request_id}</span>
                        </div>
                        <p className="text-sm text-slate-600 font-bold mt-1 line-clamp-1">{req.condition}</p>
                        <div className="flex gap-2 mt-2">
                          {req.required_resources.map(res => (
                             <span key={res} className="text-[9px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">{res}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 pl-4">
                      {processingId === req.request_id ? (
                        <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase px-4">
                          <Loader2 size={16} className="animate-spin" /> Verifying...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <button 
                            onClick={() => handleResponse(req.request_id, 'reject')}
                            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <X size={20} />
                          </button>
                          <button 
                            onClick={() => handleResponse(req.request_id, 'accept')}
                            className="bg-slate-900 text-white h-12 px-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black hover:shadow-2xl transition-all active:scale-95"
                          >
                            Accept
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card rounded-3xl p-8 border-none shadow-xl shadow-slate-200/50">
            <h3 className=" font-black text-slate-900 tracking-tight uppercase text-sm mb-6 flex items-center gap-2">
              <Activity className="text-sanjeevni-500" size={18} /> Resource Exchange Node
            </h3>
            <div className="p-8 bg-slate-50 rounded-3xl flex flex-col items-center justify-center border border-slate-100 text-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-sanjeevni-500 shadow-sm">
                 <Battery size={32} />
              </div>
              <div>
                <p className="text-slate-800 font-black text-sm uppercase tracking-tight">
                  {resourceRequests.filter(r => r.status === 'pending' && r.requesting_hospital_id !== hospitalInfo.hospital_id).length} Broadcasts Active
                </p>
                <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto mt-1">Directly fulfill peer resource needs or broadcast your own requirements to the elite network.</p>
              </div>
              <Link to="/resources" className="w-full">
                <button className="w-full px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-sm">Enter Exchange Hub</button>
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-slate-900 text-white border-0 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-center mb-6 z-10 relative">
               <h3 className=" font-black tracking-tight uppercase text-sm flex items-center gap-2">
                  <ShieldAlert size={18} /> Network News
               </h3>
               <button 
                  onClick={() => setShowNewsForm(!showNewsForm)}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl font-bold text-[9px] uppercase tracking-widest flex items-center gap-1 transition-all"
               >
                  {showNewsForm ? <X size={14} /> : <Plus size={14} />} {showNewsForm ? 'Cancel' : 'Broadcast'}
               </button>
            </div>
            
            {showNewsForm && (
               <form onSubmit={handleBroadcastNews} className="space-y-4 mb-6 pt-4 border-t border-white/10 relative z-10 animate-in slide-in-from-top-2">
                 <input 
                   type="text" 
                   placeholder="Headline" 
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-sanjeevni-500 transition-all text-white placeholder:text-white/30"
                   value={newsTitle}
                   onChange={(e) => setNewsTitle(e.target.value)}
                 />
                 <textarea 
                   placeholder="Message Content..." 
                   rows="3"
                   className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:border-sanjeevni-500 transition-all text-white placeholder:text-white/30 resize-none custom-scrollbar"
                   value={newsContent}
                   onChange={(e) => setNewsContent(e.target.value)}
                 ></textarea>
                 <button 
                   type="submit" 
                   disabled={broadcasting}
                   className="w-full py-3 bg-sanjeevni-500 hover:bg-sanjeevni-600 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg"
                 >
                   {broadcasting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} 
                   Transmit to Network
                 </button>
               </form>
            )}

            <div className="space-y-4 relative z-10">
              {news.length === 0 ? (
                <p className="text-slate-500 text-xs italic">Awaiting critical broadcasts...</p>
              ) : (
                news.map((item, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${item.source === hospitalInfo.name ? 'bg-sanjeevni-500/10 border-sanjeevni-500/30' : 'bg-white/5 border-white/5'} transition-all hover:bg-white/10 flex flex-col gap-1`}>
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[9px] text-sanjeevni-400 font-black uppercase tracking-[0.2em]">{item.source}</p>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">{new Date(item.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="font-black text-sm leading-tight text-white">{item.title}</p>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{item.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card rounded-3xl p-8 border-none shadow-xl shadow-slate-200/50">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Active Logistics</h3>
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-glow"></div>
            </div>
            <div className="space-y-5">
              {[
                ...activeTransfers.filter(t => t.status === 'confirmed').map(t => ({ id: t.request_id, label: 'Patient Transfer', status: 'In Transit', color: 'emerald' })),
                ...resourceRequests.filter(r => r.status === 'accepted').map(r => ({ id: r.id, label: `${r.resource_type} Supply`, status: 'Moving', color: 'blue' }))
              ].slice(0, 5).map((log) => (
                <div key={log.id} className="group cursor-pointer">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{log.id}</span>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-emerald-100 text-emerald-600`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                     <p className="text-[11px] font-bold text-slate-700">{log.label}</p>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 w-full bg-emerald-500 shadow-lg shadow-emerald-500/30`}></div>
                  </div>
                </div>
              ))}
              {(activeTransfers.filter(t => t.status === 'confirmed').length === 0 && resourceRequests.filter(r => r.status === 'accepted').length === 0) && (
                <p className="text-xs text-slate-300 font-bold text-center italic py-4 tracking-wider">LOGISTICS SILENT</p>
              )}
              <Link to="/resources" className="block w-full">
                <button className="w-full mt-4 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                  Detailed Manifest
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
