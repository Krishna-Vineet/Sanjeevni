import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, TrendingUp, AlertCircle, CheckCircle, RefreshCw, Loader2, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { useSanjeevni } from '../context/SanjeevniContext';

const Inventory = () => {
  const { hospitalInfo, addNotification } = useSanjeevni();
  const [items, setItems] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPrediction, setShowPrediction] = useState(true);

  useEffect(() => {
    fetchInventory();
    fetchPrediction();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.inventory.get();
      setItems(res.data.items || []);
    } catch (err) {
      console.error(err);
      addNotification("Failed to load inventory logs", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrediction = async () => {
    try {
      const res = await api.inventory.getByPrediction();
      setPrediction(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', category: 'supplies', quantity: 0, unit: 'units' }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.inventory.update({ items });
      addNotification("Inventory Synchronized with Nodes", "success");
      fetchPrediction(); // Refresh prediction after save
    } catch (err) {
      console.error(err);
      addNotification("Synchronization Failed", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
      <Loader2 className="w-10 h-10 text-sanjeevni-500 animate-spin" />
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Accessing Secure Vault...</p>
    </div>
  );

  return (
    <div className={`grid grid-cols-1 ${showPrediction ? 'lg:grid-cols-10' : 'lg:grid-cols-1'} gap-8 animate-in fade-in duration-500`}>
      <div className={`${showPrediction ? 'lg:col-span-6' : 'lg:col-span-1'} space-y-8`}>
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Fleet Inventory <Package className="text-sanjeevni-500" size={28} />
            </h1>
            <p className="text-slate-500 font-medium">Real-time asset management for <span className="text-slate-900 font-black">Elite Operations</span></p>
          </div>
          <div className="flex gap-4">
             <button 
              onClick={() => setShowPrediction(!showPrediction)} 
              className={`p-4 rounded-2xl border transition-all ${showPrediction ? 'bg-indigo-50 border-indigo-100 text-indigo-500 shadow-inner' : 'bg-white border-slate-200 text-slate-400'}`}
              title={showPrediction ? "Hide ML Analytics" : "Show ML Analytics"}
             >
                <TrendingUp size={16} />
             </button>
             <button onClick={addItem} className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-2 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-600 shadow-sm">
                <Plus size={16} /> Add Asset
             </button>
             <button 
              onClick={handleSave} 
              disabled={saving}
              className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95 disabled:opacity-50"
             >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                {saving ? 'Syncing...' : 'Sync Vault'}
             </button>
          </div>
        </header>

        <div className="card rounded-[40px] p-8 border-none shadow-2xl shadow-slate-200/50 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-50">
                  <th className="text-left py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-4">Asset Name</th>
                  <th className="text-left py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-4">Category</th>
                  <th className="text-left py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-4">In-Stock</th>
                  <th className="text-left py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-4">Unit</th>
                  <th className="text-right py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest px-4 italic">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-4 px-4">
                      <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                        placeholder="Asset Name"
                        className="bg-transparent font-bold text-slate-900 outline-none w-full"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <select 
                        value={item.category} 
                        onChange={(e) => updateItem(idx, 'category', e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase text-slate-500 outline-none"
                      >
                        <option value="supplies">Supplies</option>
                        <option value="equipment">Equipment</option>
                        <option value="medicine">Medicine</option>
                      </select>
                    </td>
                    <td className="py-4 px-4">
                        <input 
                          type="number" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)}
                          className="bg-slate-100/50 px-3 py-1.5 rounded-lg font-black text-slate-900 outline-none w-20"
                        />
                    </td>
                    <td className="py-4 px-4">
                       <input 
                        type="text" 
                        value={item.unit} 
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        className="bg-transparent font-medium text-slate-400 outline-none w-20 text-xs"
                      />
                    </td>
                    <td className="py-4 px-4 text-right">
                       <button onClick={() => removeItem(idx)} className="text-slate-200 hover:text-rose-500 transition-colors p-2 rounded-lg hover:bg-rose-50">
                          <Trash2 size={16} />
                       </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                       <div className="flex flex-col items-center gap-4 text-slate-200">
                          <Package size={48} className="opacity-10" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Inventory Manifest Empty</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showPrediction && (
        <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-right duration-500">
          <div className="card border-none bg-slate-900 text-white p-8 rounded-[40px] relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.25em] mb-8 flex items-center gap-3">
             <TrendingUp className="text-indigo-400" size={16} /> ML Surge Prediction
          </h2>

          {prediction ? (
             <div className="space-y-8">
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected Surge</p>
                      <p className="text-4xl font-black text-white">{prediction.projected_surge}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Risk Status</p>
                      <p className="text-xs font-black uppercase tracking-widest bg-indigo-500/20 px-2 py-1 rounded text-indigo-300">{prediction.risk_level}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Requirement Gap</p>
                   <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {prediction.recommendations.map((rec, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all">
                           <div className="flex justify-between items-start mb-3">
                              <p className="text-xs font-black truncate max-w-[120px]">{rec.name}</p>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${
                                rec.priority === 'critical' ? 'bg-rose-500/20 text-rose-400' : 
                                rec.priority === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {rec.priority}
                              </span>
                           </div>
                           <div className="flex justify-between items-end">
                              <div>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Need for {prediction.timeframe}</p>
                                <p className="text-sm font-black text-white">+{rec.gap} units</p>
                              </div>
                              <div className="text-right">
                                <p className="text-[8px] text-slate-500 font-bold">Total Projected</p>
                                <p className="text-[11px] font-black text-slate-300">{rec.projected_need}</p>
                              </div>
                           </div>
                           
                           {rec.gap > 0 && (
                            <button className="w-full mt-4 py-2 bg-white/5 rounded-xl text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 flex items-center justify-center gap-2">
                               Request from Network <ArrowUpRight size={10} />
                            </button>
                           )}
                        </div>
                      ))}
                   </div>
                </div>

                <div className="pt-4 text-center">
                   <p className="text-[9px] text-slate-500 font-medium italic">ML Engine Refresh: Active Coordination</p>
                </div>
             </div>
          ) : (
            <div className="py-20 text-center opacity-30">
               <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
               <p className="text-[10px] font-bold uppercase tracking-widest">Analyzing Surge Vectors...</p>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default Inventory;
