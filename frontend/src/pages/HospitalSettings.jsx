import React, { useState } from 'react';
import { Settings, Save, Bell, ShieldCheck, Database, Sliders, Loader2, CheckCircle } from 'lucide-react';
import { useSanjeevni } from '../context/SanjeevniContext';
import { api } from '../services/api';

const HospitalSettings = () => {
  const { hospitalInfo, setHospitalInfo } = useSanjeevni();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [capacity, setCapacity] = useState({
    icu_beds: hospitalInfo?.icu_beds || 0,
    general_beds: hospitalInfo?.general_beds || 0,
    oxygen_units: hospitalInfo?.oxygen_units || 0,
    ventilators: hospitalInfo?.ventilators || 0
  });

  const [settings, setSettings] = useState({
    auto_accept_enabled: hospitalInfo?.auto_accept_enabled || false,
    conditions: hospitalInfo?.auto_accept_conditions || {
      severity: 'critical',
      required_resources: ['ICU Bed']
    }
  });

  const handleSaveCapacity = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.hospital.updateCapacity(capacity);
      const updatedProfile = { ...hospitalInfo, icu_beds: capacity.icu_beds, general_beds: capacity.general_beds, oxygen_units: capacity.oxygen_units, ventilators: capacity.ventilators };
      setHospitalInfo(updatedProfile);
      localStorage.setItem('sanjeevni_hospital', JSON.stringify(updatedProfile));
      triggerSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.hospital.updateSettings(settings);
      const updatedProfile = { ...hospitalInfo, auto_accept_enabled: settings.auto_accept_enabled, auto_accept_conditions: settings.conditions };
      setHospitalInfo(updatedProfile);
      localStorage.setItem('sanjeevni_hospital', JSON.stringify(updatedProfile));
      triggerSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccess = () => {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-5 duration-700">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            Hospital Settings <Settings className="text-slate-400" size={28} />
          </h1>
          <p className="text-slate-500">Configure real-time capacity and automation rules for <b>{hospitalInfo.name}</b></p>
        </div>
        {success && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl font-bold border border-emerald-100 animate-in zoom-in-95">
            <CheckCircle size={18} /> Changes Saved Successfully
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Capacity Section */}
          <section className="card space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Database className="text-sanjeevni-500" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Resource Capacity</h3>
            </div>
            
            <form onSubmit={handleSaveCapacity} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">ICU Beds (Total Available)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none"
                  value={capacity.icu_beds}
                  onChange={(e) => setCapacity({...capacity, icu_beds: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">General Beds</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none"
                  value={capacity.general_beds}
                  onChange={(e) => setCapacity({...capacity, general_beds: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Oxygen Units (Cylinders)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none"
                  value={capacity.oxygen_units}
                  onChange={(e) => setCapacity({...capacity, oxygen_units: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Ventilators</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none"
                  value={capacity.ventilators}
                  onChange={(e) => setCapacity({...capacity, ventilators: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="sm:col-span-2 pt-4">
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                  Update Living Capacity
                </button>
              </div>
            </form>
          </section>

          {/* Automation Section */}
          <section className="card space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <Sliders className="text-amber-500" size={24} />
              <h3 className="text-xl font-bold text-slate-800">Auto-Accept Rules</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-amber-600 shadow-sm">
                  <Bell size={20} />
                </div>
                <div>
                  <p className="font-bold text-amber-800">Emergency Auto-Accept</p>
                  <p className="text-xs text-amber-600">Lower response time to sub-second level</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.auto_accept_enabled}
                  onChange={(e) => setSettings({...settings, auto_accept_enabled: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${!settings.auto_accept_enabled ? 'opacity-60 pointer-events-none grayscale' : 'transition-all duration-300'}`}>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Trigger Severity</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    value={settings.conditions.severity}
                    onChange={(e) => setSettings({
                      ...settings, 
                      conditions: { ...settings.conditions, severity: e.target.value }
                    })}
                  >
                    <option value="critical">Critical Only</option>
                    <option value="moderate">Moderate & Critical</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Target Resource</label>
                  <select 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    value={settings.conditions.required_resources[0]}
                    onChange={(e) => setSettings({
                      ...settings, 
                      conditions: { ...settings.conditions, required_resources: [e.target.value] }
                    })}
                  >
                    <option value="ICU Bed">ICU Bed</option>
                    <option value="Ventilator">Ventilator</option>
                  </select>
                </div>
              </div>
              
              <button type="submit" disabled={loading} className="w-full py-4 text-slate-700 font-bold border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                Save Automation Settings
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <div className="card bg-slate-900 text-white border-0">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-sanjeevni-400" /> Compliance
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Ensure your reported capacity is accurate within ±5%. AI audits cross-reference transfers with reported beds.
            </p>
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs">
                <p className="text-slate-500 uppercase font-bold text-[10px] mb-1">Last Updated</p>
                <p className="font-medium">14 mins ago</p>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-xs">
                <p className="text-slate-500 uppercase font-bold text-[10px] mb-1">Audit Status</p>
                <p className="font-medium text-emerald-400 flex items-center gap-1">Verified <ShieldCheck size={12} /></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalSettings;
