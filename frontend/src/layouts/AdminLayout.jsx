import React, { useState } from 'react';
import { 
  BarChart3, 
  FileUp, 
  LayoutDashboard,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: '/admin', label: 'Overview', icon: BarChart3 },
    { id: '/admin/documents', label: 'Knowledge Management', icon: FileUp },
    // Add more if needed. For now, we only need to implement the core ones in the MVP.
  ];

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-[#f8fafc]">
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-[#334155] bg-[#1e293b]/50 backdrop-blur-xl flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
            <LayoutDashboard className="w-6 h-6 text-[#0f172a]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Admin Hub</h1>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.id 
                  ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                  : 'text-[#94a3b8] hover:bg-[#0f172a]/50 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-[#334155] space-y-3">
          <button 
             onClick={() => navigate('/chat')}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all border border-blue-500/20"
          >
            <ChevronLeft className="w-4 h-4" />
            Switch to Chat
          </button>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all border border-rose-500/20">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area populated by nested routes */}
      <main className="flex-1 p-10 overflow-auto">
         <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
