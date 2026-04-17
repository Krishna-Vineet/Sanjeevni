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
  
  const [formData, setFormData] = useState({
    origin_hospital_id: hospitalInfo.id,
    patient_name: "Patient " + Math.floor(Math.random() * 1000),
    severity: 'critical',
    condition: '',
    required_resources: ['ICU Bed'],
    location: hospitalInfo.location || { lat: 28.61, lng: 77.21 }
  });

  const handleCreateRequest = async () => {
    setLoading(true);
    try {
      const res = await api.transfer.create(formData);
      setRequestId(res.data.request_id);
      
      // Immediately get matches
      const matchRes = await api.transfer.match(res.data.request_id);
      setMatches(matchRes.data.ranked_hospitals);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to initiate transfer");
    } finally {
      setLoading(false);
    }
  };

  const handleBroadcast = async () => {
    setLoading(true);
    try {
      await api.transfer.broadcast({
        request_id: requestId,
        hospital_ids: matches.map(m => m.hospital_id)
      });
      setStep(3);
      startPolling();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    const timer = setInterval(async () => {
      try {
        const res = await api.transfer.getStatus(requestId);
        setCurrentStatus(res.data);
        if (res.data.status === 'accepted') {
          clearInterval(timer);
          refreshData(); // Refresh global dashboard state
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 2000);
    return () => clearInterval(timer);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">New Transfer Request</h1>
        <p className="text-slate-500">Initiate an emergency patient transfer across the Sanjeevni network</p>
      </div>

      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center gap-2 group bg-hospital-bg">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              step >= s ? 'bg-sanjeevni-500 text-white shadow-lg shadow-sanjeevni-500/30' : 'bg-slate-200 text-slate-500'
            }`}>
              {step > s ? <CheckCircle size={18} /> : s}
            </div>
            <span className={`text-xs font-medium uppercase tracking-wider ${step >= s ? 'text-sanjeevni-600' : 'text-slate-400'}`}>
              {s === 1 ? 'Patient Info' : s === 2 ? 'Hospital Selection' : 'Live Status'}
            </span>
          </div>
        ))}
      </div>

      <div className="card min-h-[450px] flex flex-col relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-sanjeevni-500 animate-spin" />
              <p className="font-bold text-sanjeevni-700 animate-pulse">Running AI Matching Engine...</p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Step 1: Clinical Assessment</h3>
            
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Medical Severity</span>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {['stable', 'moderate', 'critical'].map((sev) => (
                    <button
                      key={sev}
                      onClick={() => setFormData({...formData, severity: sev})}
                      className={`py-3 rounded-xl border-2 transition-all capitalize font-medium ${
                        formData.severity === sev 
                        ? 'border-sanjeevni-500 bg-sanjeevni-50 text-sanjeevni-700' 
                        : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Required Resource</span>
                <select 
                  className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sanjeevni-500/20"
                  value={formData.required_resources[0]}
                  onChange={(e) => setFormData({...formData, required_resources: [e.target.value]})}
                >
                  <option>ICU Bed</option>
                  <option>Ventilator</option>
                  <option>Oxygen High-Flow</option>
                  <option>Neonatal ICU</option>
                  <option>Emergency Surgery</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Clinical Condition</span>
                <textarea 
                  className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 min-h-[120px] focus:outline-none"
                  placeholder="Describe patient vitals, symptoms, and why transfer is needed..."
                  value={formData.condition}
                  onChange={(e) => setFormData({...formData, condition: e.target.value})}
                ></textarea>
              </label>
            </div>

            <div className="pt-6 mt-auto">
              <button 
                onClick={handleCreateRequest} 
                disabled={!formData.condition}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Find Best Matching Hospitals <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Step 2: Matching Results</h3>
                <p className="text-sm text-slate-500">AI-ranked hospitals based on beds and distance</p>
              </div>
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">REQ: {requestId}</span>
            </div>
            
            <div className="space-y-3">
              {matches.map((h, i) => (
                <div key={h.hospital_id} className={`p-4 rounded-xl border-2 transition-all ${i === 0 ? 'border-sanjeevni-500 bg-sanjeevni-50/50 scale-[1.02]' : 'border-slate-50'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${i === 0 ? 'bg-sanjeevni-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {Math.round(h.score * 100)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{h.name}</span>
                          {i === 0 && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase">Optimal</span>}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin size={12} /> {h.distance_km}km • <Activity size={12} /> {h.eta_minutes} min ETA
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold text-sanjeevni-600">Available</div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{h.available_resources[0]}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 flex gap-4">
              <button onClick={() => setStep(1)} className="flex-1 py-4 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">Back</button>
              <button 
                onClick={handleBroadcast} 
                className="btn-primary flex-2 py-4 text-lg bg-emergency hover:bg-emergency-dark flex items-center justify-center gap-2"
              >
                <ShieldAlert size={20} /> Broadcast Code Red
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-8">
            <div className="relative">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-1000 ${
                currentStatus?.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-500 animate-pulse'
              }`}>
                {currentStatus?.status === 'accepted' ? <CheckCircle size={64} /> : <Activity size={64} />}
              </div>
              {currentStatus?.status !== 'accepted' && (
                <div className="absolute -inset-4 border-2 border-rose-200 rounded-full animate-ping opacity-20"></div>
              )}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {currentStatus?.status === 'accepted' ? 'Transfer Accepted!' : 'Broadcasting Live...'}
              </h3>
              <p className="text-slate-500 max-w-sm mt-2">
                {currentStatus?.status === 'accepted' 
                  ? `Success! ${matches.find(m => m.hospital_id === currentStatus.assigned_hospital)?.name || 'A hospital'} has accepted. Coordinating ambulance arrival.`
                  : 'Wait time: Expected 2-5 minutes for response. System is scanning live capacity of 3 hospitals.'}
              </p>
            </div>

            {currentStatus?.status === 'accepted' ? (
              <div className="w-full space-y-4">
                 <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center gap-4 text-left">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 shadow-sm font-bold">A</div>
                  <div>
                    <p className="text-emerald-800 font-bold">Ambulance Assigned</p>
                    <p className="text-emerald-600 text-sm">ETA at currently hospital: 8 mins</p>
                  </div>
                </div>
                <button onClick={() => setStep(1)} className="btn-primary w-full py-4 bg-slate-800 hover:bg-slate-900">Done / Track on Dashboard</button>
              </div>
            ) : (
              <div className="w-full space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Responses</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                    <span className="w-2 h-2 bg-slate-300 rounded-full"></span>
                  </div>
                </div>
                <button disabled className="w-full py-4 text-slate-400 font-medium">Waiting for response...</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransferRequest;
