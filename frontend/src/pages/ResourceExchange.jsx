import React, { useState, useEffect } from 'react';
import { Package, Truck, ArrowRight, ShieldCheck, Plus, Search, Loader2, X } from 'lucide-react';
import { api } from '../services/api';
import { useSanjeevni } from '../context/SanjeevniContext';

const ResourceExchange = () => {
  const { hospitalInfo } = useSanjeevni();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ hospitals_asked: 0, hospitals_helped: 0 });
  const [loading, setLoading] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    resource_type: 'Oxygen',
    quantity: 10
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
    const interval = setInterval(() => {
        fetchRequests();
        fetchStats();
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.resource.getAll();
      setRequests(res.data.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.resource.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.resource.createRequest(newRequestData);
      setShowNewRequest(false);
      fetchRequests();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async (requestId) => {
    setLoading(true);
    try {
      await api.resource.respond({
        resource_request_id: requestId,
        response: 'accept'
      });
      fetchRequests();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm("Are you sure you want to withdraw this broadcast?")) return;
    setLoading(true);
    try {
      await api.resource.cancelRequest(requestId);
      fetchRequests();
      fetchStats();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!hospitalInfo) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Resource Exchange Hub</h1>
          <p className="text-slate-500 font-medium">Coordinate and share life-saving assets across the <span className="text-slate-900 font-bold">Elite Node Network</span></p>
        </div>
        <button 
          onClick={() => setShowNewRequest(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all shadow-xl shadow-slate-900/10"
        >
          <Plus size={18} /> Broadcast Need
        </button>
      </header>

      {showNewRequest && (
        <div className="card bg-slate-900 text-white border-0 rounded-3xl p-8 animate-in slide-in-from-top-4 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
             <Package size={16} className="text-sanjeevni-400" /> New Network Request
          </h3>
          <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Type</label>
              <select 
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/20"
                value={newRequestData.resource_type}
                onChange={(e) => setNewRequestData({...newRequestData, resource_type: e.target.value})}
              >
                <option className="text-slate-900">Oxygen</option>
                <option className="text-slate-900">Blood (O-)</option>
                <option className="text-slate-900">Remdesivir</option>
                <option className="text-slate-900">PPE Kits</option>
                <option className="text-slate-900">Dialysis Gear</option>
              </select>
            </div>
            <div className="flex gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty</label>
                <input 
                  type="number" 
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none"
                  value={newRequestData.quantity}
                  onChange={(e) => setNewRequestData({...newRequestData, quantity: e.target.value})}
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit</label>
                <input 
                  type="text" 
                  placeholder="Units/litres/kits"
                  className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold focus:outline-none"
                  value={newRequestData.unit}
                  onChange={(e) => setNewRequestData({...newRequestData, unit: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
              <select 
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none"
                value={newRequestData.priority}
                onChange={(e) => setNewRequestData({...newRequestData, priority: e.target.value})}
              >
                <option value="normal" className="text-slate-900">Normal</option>
                <option value="urgent" className="text-slate-900">Urgent</option>
                <option value="emergency" className="text-slate-900">Emergency</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Notes</label>
              <input 
                type="text" 
                placeholder="Specific instructions..."
                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold focus:outline-none"
                value={newRequestData.notes}
                onChange={(e) => setNewRequestData({...newRequestData, notes: e.target.value})}
              />
            </div>
            <div className="md:col-span-4 flex gap-4 pt-4">
              <button 
                type="button" 
                onClick={() => setShowNewRequest(false)}
                className="px-8 py-4 font-black text-slate-400 hover:text-white transition-all text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-sanjeevni-500 text-white py-4 px-8 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-sanjeevni-600 transition-all shadow-lg shadow-sanjeevni-500/30"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={16} />}
                Transmit Uplink
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-white shadow-xl shadow-slate-200/50 border-none rounded-3xl p-10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Network Request Logic</h3>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">10 Nodes Coverage</span>
              </div>
            </div>

            <div className="space-y-5">
              {requests.length === 0 ? (
                <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                   <Package size={48} className="mx-auto text-slate-100 mb-4" />
                   <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">No Active Network Needs</p>
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-7 bg-slate-50/50 rounded-3xl border border-slate-100/50 group hover:border-slate-300 transition-all hover:bg-white shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105 ${
                        req.status === 'accepted' ? 'bg-emerald-500 text-white' : 'bg-white text-slate-900 border border-slate-100'
                      }`}>
                        <Package size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-black text-slate-900 text-lg uppercase tracking-tight">{req.resource_type}</p>
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                            req.priority === 'emergency' ? 'bg-rose-500 text-white' : 
                            req.priority === 'urgent' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.priority}
                          </span>
                          <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                            req.status === 'accepted' || req.status === 'shipped' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-sm font-bold text-slate-500 mt-0.5">Quantity: <span className="text-slate-900">{req.quantity} {req.unit}</span></p>
                        {req.notes && <p className="text-[11px] text-slate-400 mt-2 bg-slate-100 p-2 rounded-xl italic">"{req.notes}"</p>}
                        <p className="text-[10px] text-slate-400 mt-2 uppercase font-black tracking-widest">
                            {(req.requesting_hospital_id === hospitalInfo?.hospital_id || req.requesting_hospital_id === hospitalInfo?.id) ? '🚨 YOUR REQUEST' : `Node ID: ${req.requesting_hospital_id}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-3 items-center">
                        {/* ACTIONS FOR OTHER HOSPITALS */}
                        {req.status === 'pending' && (req.requesting_hospital_id !== hospitalInfo?.hospital_id && req.requesting_hospital_id !== hospitalInfo?.id) && (
                          <button 
                              onClick={() => handleFulfill(req.id)}
                              className="px-8 h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all shadow-lg active:scale-95"
                          >
                              <Truck size={18} /> Initiate Fulfillment
                          </button>
                        )}

                        {/* LOGISTICS CONTROLS FOR INVOLVED PARTIES */}
                        {(req.status === 'accepted' || req.status === 'shipped' || req.status === 'delivered') && (
                          <div className="flex flex-col items-end gap-3">
                             <div className="flex gap-2">
                                {req.status === 'accepted' && (req.fulfilled_by === hospitalInfo?.hospital_id) && (
                                  <button 
                                    onClick={() => handleUpdateLogistics(req.id, 'shipped')}
                                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                                  >
                                    Mark Shipped
                                  </button>
                                )}
                                {req.status === 'shipped' && (req.requesting_hospital_id === hospitalInfo?.hospital_id || req.requesting_hospital_id === hospitalInfo?.id) && (
                                  <button 
                                    onClick={() => handleUpdateLogistics(req.id, 'delivered')}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                                  >
                                    Confirm Delivery
                                  </button>
                                )}
                                {req.status === 'delivered' && (req.requesting_hospital_id === hospitalInfo?.hospital_id || req.requesting_hospital_id === hospitalInfo?.id) && (
                                  <button 
                                    onClick={() => handleUpdateLogistics(req.id, 'completed')}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest"
                                  >
                                    Complete Audit
                                  </button>
                                )}
                             </div>
                             <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mr-2">
                                Fulfilled by: <b className="text-slate-900">{req.fulfilled_by}</b>
                             </span>
                          </div>
                        )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card bg-emerald-500 text-white border-0 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-emerald-500/20">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8">Node Reputation</h3>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span>Network Trust Score</span>
                  <span>{Math.min(100, stats.trust_score || 60)}%</span>
                </div>
                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full shadow-[0_0_12px_rgba(255,255,255,0.5)] transition-all duration-1000"
                    style={{ width: `${Math.min(100, stats.trust_score || 60)}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-5 rounded-3xl text-center border border-white/5 backdrop-blur-sm">
                  <p className="text-3xl font-black tracking-tighter">{stats.hospitals_asked}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">Hospitals Asked</p>
                </div>
                <div className="bg-white/10 p-5 rounded-3xl text-center border border-white/5 backdrop-blur-sm">
                  <p className="text-3xl font-black tracking-tighter">{stats.hospitals_helped}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">Hospitals Helped</p>
                </div>
              </div>

              <div className="p-5 bg-white/10 rounded-3xl text-[11px] font-black leading-relaxed border border-white/5">
                <span className="text-emerald-100 opacity-60 uppercase tracking-widest block mb-2">Network Insights</span>
                Your collaboration footprint is <span className="text-white underline underline-offset-4">Top 3%</span>. Node stability is optimized.
              </div>
            </div>
          </div>

          <div className="card rounded-3xl p-8 border-none shadow-xl shadow-slate-200/50 overflow-hidden relative">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Delivery Active Links</h4>
            <div className="space-y-4">
              {requests.filter(r => r.status === 'accepted').length === 0 ? (
                <div className="flex gap-5 items-center opacity-40">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
                     <Truck size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Uplink Silent</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 tracking-tight">No active logistics tracked</p>
                  </div>
                </div>
              ) : (
                requests.filter(r => r.status === 'accepted').map((delivery) => (
                  <div key={delivery.id} className="flex gap-4 p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all group">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <Truck size={20} />
                     </div>
                     <div className="flex-1">
                       <div className="flex justify-between items-start">
                         <p className="text-[10px] font-black uppercase text-slate-900 tracking-tight">{delivery.resource_type}</p>
                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">In Transit</span>
                       </div>
                       <p className="text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-tighter">
                          {delivery.requesting_hospital_id === (hospitalInfo?.hospital_id || hospitalInfo?.id) 
                            ? `Incoming from ${delivery.fulfilled_by}` 
                            : `Dispatching to ${delivery.requesting_hospital_id}`}
                       </p>
                     </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceExchange;
