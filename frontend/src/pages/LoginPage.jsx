import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Shield, Users, Briefcase, FileText, Settings, UserPlus, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const roles = [
  { id: 'engineering', label: 'Engineering', icon: Shield, color: 'rgb(59, 130, 246)' },
  { id: 'finance', label: 'Finance', icon: Briefcase, color: 'rgb(34, 197, 94)' },
  { id: 'hr', label: 'Human Resources', icon: Users, color: 'rgb(168, 85, 247)' },
  { id: 'admin', label: 'Administrator', icon: Settings, color: 'rgb(245, 158, 11)' },
];

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('engineering'); // Only used during Register
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        // Only need email/password for actual login now mapping to real backend
        const user = await login(email, password);
        navigate(user.role === 'admin' ? '/admin' : '/chat');
      } else {
        // Used for the initial setup to create an account easily
        const user = await register(email, password, selectedRole);
        navigate(user.role === 'admin' ? '/admin' : '/chat');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] p-4 text-[#f8fafc]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1e293b] rounded-2xl shadow-2xl p-8 border border-[#334155] backdrop-blur-sm"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-500 rounded-xl mb-4 shadow-lg shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">SecureRAG</h1>
          <p className="text-[#94a3b8] text-center">
             {isLogin ? "Enter credentials to access the internal AI" : "Create a new internal account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 border border-rose-500/50 text-rose-400 p-3 rounded-lg flex items-center gap-2 text-sm font-medium"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#94a3b8]">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[#475569]"
              placeholder="user@internal.company"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#94a3b8]">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-[#475569]"
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }} 
               animate={{ opacity: 1, height: 'auto' }}
               className="space-y-2"
            >
               <label className="text-sm font-medium text-[#94a3b8]">Select RBAC Role</label>
               <div className="grid grid-cols-2 gap-3">
                 {roles.map((role) => (
                   <button
                     key={role.id}
                     type="button"
                     onClick={() => setSelectedRole(role.id)}
                     className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                       selectedRole === role.id 
                         ? `bg-[${role.color}]/10 border-[${role.color}]/50 text-blue-400 ring-1 ring-blue-500/30` 
                         : 'bg-[#0f172a] border-[#334155] text-[#94a3b8] hover:border-[#475569]'
                     }`}
                     style={selectedRole === role.id ? { color: role.color, borderColor: `${role.color}80`, backgroundColor: `${role.color}15` } : {}}
                   >
                     <role.icon className="w-4 h-4" />
                     {role.label}
                   </button>
                 ))}
               </div>
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-[#334155] disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isLogin ? (
              <LogIn className="w-5 h-5" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#334155] text-center flex flex-col items-center gap-3">
           <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
              className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors bg-transparent border-none cursor-pointer"
           >
             {isLogin ? "Need a demo account? Register here." : "Already have an account? Sign in."}
           </button>
           <p className="text-xs text-[#64748b]">
             Strict usage policies apply. Access is monitored.
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
