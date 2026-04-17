import React from 'react';
import { BarChart3, TrendingUp, Users, Activity, Clock, ShieldCheck, Map, ArrowUpRight } from 'lucide-react';

const MetricCard = ({ label, value, sub, color, border }) => (
  <div className={`card overflow-hidden relative ${border ? 'border-2 border-sanjeevni-100' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <div className={`w-8 h-8 rounded-lg bg-${color}-50 flex items-center justify-center text-${color}-600`}>
        <TrendingUp size={16} />
      </div>
    </div>
    <p className="text-3xl font-black text-slate-800">{value}</p>
    <p className={`text-xs mt-1 font-bold ${sub.includes('+') ? 'text-emerald-500' : 'text-slate-400'}`}>{sub}</p>
  </div>
);

const Analytics = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            System Analytics <BarChart3 className="text-sanjeevni-500" size={32} />
          </h1>
          <p className="text-slate-500">Advanced predictive insights and performance metrics for Sanjeevni Node</p>
        </div>
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          <button className="px-4 py-2 bg-white text-slate-800 text-xs font-bold rounded-lg shadow-sm">24 Hours</button>
          <button className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-white/50 rounded-lg transition-all">7 Days</button>
          <button className="px-4 py-2 text-slate-500 text-xs font-bold hover:bg-white/50 rounded-lg transition-all">Monthly</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Node Efficiency" value="94.2%" sub="+2.1% efficiency gain" color="sanjeevni" border />
        <MetricCard label="Avg Response" value="1.8s" sub="Sub-second goal active" color="blue" />
        <MetricCard label="Successful Xfers" value="128" sub="100% success rate today" color="emerald" />
        <MetricCard label="Network Load" value="68%" sub="Stable threshold" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="card">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity size={20} className="text-sanjeevni-500" /> Hourly Throughput
            </h3>
            <div className="h-64 flex items-end justify-between gap-3 px-4 pb-4 border-b border-l border-slate-100">
              {[30, 45, 25, 60, 85, 40, 55, 75, 50, 90, 65, 80].map((h, i) => (
                <div key={i} className="flex-1 group relative">
                  <div 
                    className="w-full bg-sanjeevni-500/20 rounded-t-lg transition-all duration-500 hover:bg-sanjeevni-500 cursor-pointer" 
                    style={{ height: `${h}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h} cases/hr
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2">
              {['08:00', '12:00', '16:00', '20:00', '00:00'].map(t => (
                <span key={t} className="text-[10px] font-bold text-slate-400">{t}</span>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="card bg-slate-900 text-white border-0 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-sanjeevni-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-sanjeevni-400" /> Triage Accuracy (AI)
                </h4>
                <div className="flex items-center gap-8">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                      <circle cx="48" cy="48" r="40" fill="transparent" stroke="#14b8a6" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="25.12" strokeLinecap="round" className="transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center font-black text-xl">
                      90%
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-slate-400 font-medium">Agreement with Senior Doctors</p>
                    <p className="text-lg font-bold text-sanjeevni-400">High Reliability</p>
                  </div>
                </div>
             </div>

             <div className="card">
                <h4 className="text-sm font-bold mb-6 flex items-center gap-2">
                  <Map size={18} className="text-blue-500" /> Proximity Impact
                </h4>
                <div className="space-y-4">
                  {[
                    { label: 'Within 2km', value: 82, color: 'sanjeevni' },
                    { label: '2km - 5km', value: 45, color: 'blue' },
                    { label: 'Above 5km', value: 18, color: 'amber' }
                  ].map(item => (
                    <div key={item.label} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500 tracking-widest">
                        <span>{item.label}</span>
                        <span>{item.value} transfers</span>
                      </div>
                      <div className="w-full bg-slate-50 h-1.5 rounded-full">
                        <div className={`bg-${item.color}-500 h-full rounded-full`} style={{ width: `${(item.value / 100) * 100}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="card">
            <h3 className="text-lg font-bold mb-6">Optimization Insights</h3>
            <div className="space-y-6">
              <div className="flex gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                  <ArrowUpRight size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Surge Ready</p>
                  <p className="text-sm text-emerald-700 font-medium mt-1">Resource allocation to Medanta successfully prevented a local oxygen shortage at 14:00.</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upcoming Challenges</h4>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  Traffic congestion predicted on NH-8 may increase ETA for ambulances from Artemis Hospital by <span className="text-rose-600 font-black">+4 mins</span>.
                </p>
              </div>

              <div className="p-5 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform duration-700 group-hover:scale-150"></div>
                <h5 className="text-xs font-bold text-sanjeevni-400 uppercase tracking-widest mb-2">Network Recommendation</h5>
                <p className="text-sm font-medium leading-relaxed">
                  Shift 2 Ventilators from Fortis Hospital Gurgaon to Artemis Hospital temporarily based on predictive surge in West Zone.
                </p>
                <button className="mt-4 w-full py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-sanjeevni-50 transition-all">
                  Apply Strategy
                </button>
              </div>
            </div>
          </section>

          <section className="card">
            <h3 className="text-lg font-bold mb-6">Dispatch Latency</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <p className="text-5xl font-black text-slate-800 tracking-tighter">0.4<span className="text-2xl">s</span></p>
                <span className="text-emerald-500 text-xs font-bold mb-2">Live Monitor</span>
              </div>
              <p className="text-xs text-slate-400 font-medium tracking-wide">Mean time for AI to broadcast request after initial submission.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
