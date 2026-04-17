import React, { useState, useEffect } from 'react';
import { Package, Truck, ArrowRight, ShieldCheck, Plus, Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import { useSanjeevni } from '../context/SanjeevniContext';

const ResourceExchange = () => {
  const { hospitalInfo } = useSanjeevni();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [newRequestData, setNewRequestData] = useState({
    hospital_id: hospitalInfo.id,
    resource_type: 'Oxygen',
    quantity: 10
  });

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.resource.getAll();
      setRequests(res.data.requests);
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
        hospital_id: hospitalInfo.id,
        response: 'accept'
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Resource Exchange Hub</h1>
          <p className="text-slate-500">Coordinate and share life-saving resources across the hospital network</p>
        </div>
        <button 
          onClick={() => setShowNewRequest(true)}
          className="btn-primary flex items-center gap-2 px-6 py-3"
        >
          <Plus size={20} /> New Resource Request
        </button>
      </header>

      {showNewRequest && (
        <div className="card bg-sanjeevni-50 border-sanjeevni-200 animate-in slide-in-from-top-4">
          <form onSubmit={handleCreateRequest} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-sanjeevni-700 uppercase">Resource Type</label>
              <select 
                className="w-full bg-white border border-sanjeevni-200 rounded-xl px-4 py-3 focus:outline-none"
                value={newRequestData.resource_type}
                onChange={(e) => setNewRequestData({...newRequestData, resource_type: e.target.value})}
              >
                <option>Oxygen</option>
                <option>Blood (O-)</option>
                <option>Remdesivir</option>
                <option>Personal Protective Equipment</option>
                <option>Dialysis Kits</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-sanjeevni-700 uppercase">Quantity Needed</label>
              <input 
                type="number" 
                className="w-full bg-white border border-sanjeevni-200 rounded-xl px-4 py-3 focus:outline-none"
                value={newRequestData.quantity}
                onChange={(e) => setNewRequestData({...newRequestData, quantity: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowNewRequest(false)}
                className="flex-1 py-3 font-bold text-slate-500 hover:bg-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Package size={20} />}
                Broadcast Request
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Network Inventory Needs</h3>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filtered by geography..."
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  No active resource requests in the network.
                </div>
              ) : (
                requests.map((req) => (
                  <div key={req.resource_request_id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-sanjeevni-300 transition-all">
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold shadow-sm ${
                        req.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-sanjeevni-600'
                      }`}>
                        <Package size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-lg uppercase tracking-tight">{req.resource_type}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            req.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Need: <b>{req.quantity} Units</b> • Reported 2h ago</p>
                        <p className="text-xs text-sanjeevni-600 mt-1 uppercase font-bold tracking-widest">{req.hospital_id === hospitalInfo.id ? 'Your Request' : 'Medanta - The Medicity (8.2km away)'}</p>
                      </div>
                    </div>
                    
                    {req.status === 'pending' && req.hospital_id !== hospitalInfo.id && (
                      <button 
                        onClick={() => handleFulfill(req.resource_request_id)}
                        className="mt-4 md:mt-0 px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-3 hover:border-sanjeevni-500 hover:text-sanjeevni-600 transition-all"
                      >
                        <Truck size={18} /> Fulfill Now
                      </button>
                    )}
                    {req.status === 'accepted' && (
                      <div className="mt-4 md:mt-0 flex items-center gap-2 text-emerald-600 font-bold px-4 py-2 bg-emerald-50 rounded-lg">
                        <ShieldCheck size={20} /> Supply Chain Verified
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card glass relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sanjeevni-100/50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10"></div>
            <h3 className="text-lg font-bold mb-4">Sharing Analytics</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Trust Score</span>
                  <span className="text-sanjeevni-600">92/100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="w-[92%] h-full bg-sanjeevni-500 rounded-full"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  <p className="text-2xl font-black text-slate-800">42</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lives Impacted</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                  <p className="text-2xl font-black text-slate-800">12</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shares Made</p>
                </div>
              </div>

              <div className="p-4 bg-sanjeevni-900 text-white rounded-2xl relative">
                <p className="text-xs font-bold text-sanjeevni-300 uppercase mb-1">Network Note</p>
                <p className="text-sm font-medium leading-relaxed">Your prompt fulfillment of oxygen to H2 last week improved network stability by 14%.</p>
              </div>
            </div>
          </div>

          <div className="card p-0 overflow-hidden border-2 border-slate-100">
            <div className="bg-slate-50 p-4 border-b border-slate-200">
              <h4 className="font-bold text-slate-800 text-sm">Delivery Live Track</h4>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex gap-4 relative">
                <div className="absolute left-[9px] top-6 w-[2px] h-8 bg-slate-200"></div>
                <div className="w-5 h-5 bg-sanjeevni-500 rounded-full ring-4 ring-sanjeevni-50 shrink-0"></div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Ambulance #402</p>
                  <p className="text-[10px] text-slate-500">Delivering Oxygen • 2 mins away</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-5 h-5 bg-slate-200 rounded-full shrink-0"></div>
                <div className="opacity-50">
                  <p className="text-xs font-bold text-slate-800">Pending Pickup</p>
                  <p className="text-[10px] text-slate-500">Blood Unit O- • Artemis Hospital</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceExchange;
