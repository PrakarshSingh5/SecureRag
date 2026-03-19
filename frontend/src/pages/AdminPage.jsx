import React from 'react';
import { 
  Users, 
  ShieldAlert, 
  DollarSign, 
  HardDrive, 
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminPage = () => {
  const stats = [
    { label: 'Total Chunks', value: '12,402', icon: HardDrive, change: '+12%', positive: true, color: 'blue' },
    { label: 'Active Users', value: '84', icon: Users, change: '+5%', positive: true, color: 'emerald' },
    { label: 'Cost this month', value: '$142.50', icon: DollarSign, change: '-8%', positive: true, color: 'amber' },
    { label: 'Guardrail Hits', value: '23', icon: ShieldAlert, change: '+2', positive: false, color: 'rose' },
  ];

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold mb-1">System Management</h2>
          <p className="text-[#94a3b8]">Global monitoring and indexing control panel</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-sm font-medium">All systems operational</span>
            </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -5 }}
            className="bg-[#1e293b] border border-[#334155] p-6 rounded-2xl shadow-xl relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 p-4 opacity-10 transition-opacity group-hover:opacity-20`}>
              <stat.icon className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
              </div>
              <p className="text-sm font-medium text-[#94a3b8]">{stat.label}</p>
            </div>
            <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">{stat.value}</h3>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {stat.change}
                </div>
            </div>
          </motion.div>
        ))}
      </div>

       <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/20 p-8 rounded-2xl flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold mb-1">Knowledge Sync</h4>
              <p className="text-sm text-[#94a3b8]">Optimize your vector database clusters for faster retrieval</p>
            </div>
            <button className="px-6 py-3 bg-white text-[#0f172a] font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl">
              Run Optimization
            </button>
       </div>
    </>
  );
};

export default AdminPage;
