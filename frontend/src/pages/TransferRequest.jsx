import React, { useState, useEffect } from 'react';
import { Send, MapPin, Activity, ShieldAlert, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useSanjeevni } from '../context/SanjeevniContext';

const TransferRequest = () => {
  const { hospitalInfo, refreshData } = useSanjeevni();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState(null);
  const [matches, setMatches] = useState([]);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [formData, setFormData] = useState({
    origin_hospital_id: hospitalInfo?.hospital_id || '',
    patient_name: "Patient " + Math.floor(Math.random() * 1000),
    severity: 'critical',
    condition: '',
    required_resources: ['ICU Bed'],
    location: hospitalInfo?.location || { lat: 28.4595, lng: 77.0266 }
  });

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.transfer.getHistory();
      setHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Ensure formData is updated when hospitalInfo loads
  useEffect(() => {
    if (hospitalInfo && !formData.origin_hospital_id) {
      setFormData(prev => ({
        ...prev,
        origin_hospital_id: hospitalInfo.hospital_id,
        location: hospitalInfo.location || prev.location
      }));
    }
  }, [hospitalInfo]);

  if (!hospitalInfo) return null;

  const handleCreateRequest = async () => {
    setLoading(true);
    try {
      const res = await api.transfer.create(formData);
      setRequestId(res.data.request_id);
      
      const matchRes = await api.transfer.match(res.data.request_id);
      setMatches(matchRes.data.ranked_hospitals);
      setStep(2);
      fetchHistory(); // Refresh history
    } catch (err) {
      console.error(err);
      alert("Failed to initiate transfer");
    } finally {
      setLoading(false);
    }
  };

  // ... (keeping handleBroadcast and startPolling the same)
  const handleBroadcast = async () => {
    setLoading(true);
    try {
      await api.transfer.broadcast({
        request_id: requestId,
        hospital_ids: matches.map(m => m.hospital_id)
      });
      setStep(3);
      startPolling(requestId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (rid) => {
    const timer = setInterval(async () => {
      try {
        const res = await api.transfer.getStatus(rid);
        setCurrentStatus(res.data);
        if (res.data.status === 'confirmed') {
          clearInterval(timer);
          refreshData();
          fetchHistory();
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);
    return () => clearInterval(timer);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
      {/* Left Sidebar: Movement History */}
      <div className="lg:col-span-1 space-y-6">
        <div className="card border-none bg-slate-900 text-white p-6 rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emergency-red/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            <Activity className="text-emergency-red" size={14} /> Movement Logs
          </h2>
          
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {history.length === 0 ? (
              <div className="py-10 text-center opacity-40">
                <p className="text-[10px] font-bold uppercase">No records found</p>
              </div>
            ) : (
              history.map((item) => (
                <div key={item.request_id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group">
                   <div className="flex justify-between items-center mb-2">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                        item.type === 'Outgoing' ? 'bg-emergency-red/20 text-emergency-red' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {item.type}
                      </span>
                      <span className="text-[8px] text-slate-500 font-bold">{new Date(item.date).toLocaleDateString()}</span>
                   </div>
                   <p className="text-xs font-black truncate">{item.patient_name}</p>
                   <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 font-bold italic truncate">
                      {item.type === 'Outgoing' ? 'To: ' : 'From: '} {item.partner_node}
                   </p>
                   <div className="mt-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase text-slate-500">{item.status}</span>
                      <ChevronRight size={12} className="text-slate-500" />
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             Fleet Transfer Protocol <ShieldAlert className="text-emergency-red" size={28} />
          </h1>
          <p className="text-slate-500 font-medium">Coordinating mission-critical patient movement across the <span className="text-slate-900 font-black">Elite Node Network</span></p>
        </div>

        <div className="flex justify-between mb-8 relative">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ? 'bg-emergency-red text-white shadow-lg shadow-emergency-red/30' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > s ? <CheckCircle size={18} /> : s}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-emergency-red' : 'text-slate-400'}`}>
                {s === 1 ? 'Condition' : s === 2 ? 'Elite Match' : 'Broadcast'}
              </span>
            </div>
          ))}
        </div>

        <div className="card min-h-[500px] flex flex-col relative overflow-hidden bg-white shadow-2xl shadow-slate-200/60 border-none rounded-[40px] p-8">
          {loading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-30 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-emergency-red animate-spin" />
                <p className="font-black text-slate-900 animate-pulse uppercase tracking-[0.2em] text-[10px]">Scanning Critical Capacity...</p>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-8">
              <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tighter italic">
                 <Activity className="text-emergency-red" size={24} /> Clinical Assessment
              </h3>
              
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Emergency Severity Threshold</span>
                  <div className="grid grid-cols-3 gap-4">
                    {['stable', 'moderate', 'critical'].map((sev) => (
                      <button
                        key={sev}
                        onClick={() => setFormData({...formData, severity: sev})}
                        className={`py-5 rounded-3xl border-2 transition-all capitalize font-black text-xs tracking-widest ${
                          formData.severity === sev 
                          ? 'border-emergency-red bg-emergency-red/5 text-emergency-red shadow-lg shadow-emergency-red/10' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-100 hover:bg-white'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Required Asset</span>
                    <select 
                      className="w-full bg-slate-50 border border-slate-50 rounded-3xl px-6 py-5 text-xs font-black uppercase tracking-wide focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer"
                      value={formData.required_resources[0]}
                      onChange={(e) => setFormData({...formData, required_resources: [e.target.value]})}
                    >
                      <option>ICU Bed</option>
                      <option>Ventilator</option>
                      <option>Oxygen High-Flow</option>
                      <option>Cardiac Support</option>
                      <option>Neuro Surgical</option>
                    </select>
                  </div>
                  <div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Patient Identification</span>
                     <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-50 rounded-3xl px-6 py-5 text-sm font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                      value={formData.patient_name}
                      onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                     />
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Code Red Briefing</span>
                  <textarea 
                    className="w-full bg-slate-50 border border-slate-50 rounded-[32px] px-8 py-6 min-h-[160px] text-sm font-medium focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all leading-relaxed"
                    placeholder="Immediate clinical requirements..."
                    value={formData.condition}
                    onChange={(e) => setFormData({...formData, condition: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="pt-8 mt-auto">
                <button 
                  onClick={handleCreateRequest} 
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl shadow-slate-900/40 active:scale-[0.98]"
                >
                  Initiate Elite Scan <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Elite Match Analysis</h3>
                  <p className="text-[10px] font-black text-slate-400 bg-slate-50 px-4 py-2 rounded-full uppercase tracking-widest">ID: {requestId}</p>
               </div>
               
               <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {matches.map((h, i) => (
                    <div key={h.hospital_id} className={`p-6 rounded-[32px] border-2 transition-all ${i < 3 ? 'border-amber-200 bg-amber-50/20' : 'border-slate-50 bg-slate-50/50'}`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-5">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm rotate-3 ${i < 3 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-slate-200 text-slate-500'}`}>
                            {Math.round(h.score * 100)}%
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{h.name}</span>
                              {i < 3 && <span className="text-[9px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Elite Rank</span>}
                            </div>
                            <div className="flex items-center gap-4 mt-1.5">
                               <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 tracking-tight uppercase">
                                  <MapPin size={12} className="text-slate-400" /> {h.distance_km}km
                               </span>
                               <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 tracking-tight uppercase text-emergency-red">
                                  <Activity size={12} className="text-emergency-red/40" /> {h.eta_minutes} Min ETA
                               </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
               </div>

               <div className="pt-8 flex gap-6">
                  <button onClick={() => setStep(1)} className="flex-1 py-6 font-black text-slate-400 hover:text-slate-600 text-xs uppercase tracking-widest">Back</button>
                  <button 
                    onClick={handleBroadcast} 
                    className="flex-3 py-6 bg-emergency-red text-white rounded-3xl font-black text-sm uppercase tracking-[0.25em] shadow-2xl shadow-emergency-red/40 hover:scale-[1.02] transition-transform active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    Broadcast Code Red
                  </button>
               </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-12 animate-in zoom-in-95">
              <div className="relative">
                <div className={`w-40 h-40 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  currentStatus?.status === 'confirmed' ? 'bg-emerald-500 text-white shadow-[0_0_60px_rgba(16,185,129,0.3)]' : 'bg-emergency-red/5 text-emergency-red'
                }`}>
                  {currentStatus?.status === 'confirmed' ? <CheckCircle size={80} strokeWidth={3} /> : <div className="p-10 border-4 border-emergency-red/40 border-t-emergency-red rounded-full animate-spin"></div>}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-4xl font-black text-slate-900 tracking-tighter">
                  {currentStatus?.status === 'confirmed' ? 'PROTOCOL CONFIRMED' : 'NETWORK UPLINK ACTIVE'}
                </h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm font-medium leading-relaxed uppercase tracking-tight">
                  {currentStatus?.status === 'confirmed' 
                    ? `Elite Protocol established. Node ${currentStatus.assigned_hospital} has priority-assigned the request.`
                    : 'System is negotiating with fleet nodes. Auto-approval protocol will trigger upon first elite match.'}
                </p>
              </div>

              {currentStatus?.status === 'confirmed' && (
                <div className="w-full max-w-md space-y-4">
                   <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[40px] flex items-center gap-6 text-left shadow-sm">
                      <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-500/10">
                         <MapPin size={32} />
                      </div>
                      <div>
                        <p className="text-emerald-900 font-black text-xl tracking-tighter">Transfer Live</p>
                        <p className="text-emerald-700 font-bold uppercase text-[10px] tracking-widest mt-1 opacity-80">Logistics finalized with node</p>
                      </div>
                   </div>
                   <button onClick={() => setStep(1)} className="w-full py-6 bg-slate-900 text-white rounded-3xl font-black tracking-[0.2em] uppercase text-xs hover:bg-black transition-all shadow-2xl shadow-slate-900/20">Return to Operations</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferRequest;
