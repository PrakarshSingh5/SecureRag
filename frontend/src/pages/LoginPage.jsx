import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Shield, Users, Briefcase, FileText, Settings, UserPlus, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const user = await login(email, password);
        navigate(user.role === 'admin' ? '/admin' : '/chat');
      } else {
        const user = await register(email, password, 'user');
        navigate('/chat');
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f3f4f6] p-4 text-[#111827] font-sans selection:bg-blue-100 relative overflow-hidden">
      
      {/* Decorative background circle */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-[#e5e7eb] relative overflow-hidden"
      >
        {/* Subtle decorative top bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 shadow-[0_4px_10px_rgba(37,99,235,0.1)]" />
        
        <div className="flex flex-col items-center mb-10">
          <div className="p-3 bg-blue-600 rounded-xl mb-6 shadow-md shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-[#111827]">SecureRAG</h1>
          <p className="text-[#6b7280] text-center font-medium max-w-[280px]">
             {isLogin ? "Sign in to access secure documents" : "Create your internal company account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#4b5563] ml-1 uppercase tracking-widest">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-[#d1d5db] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-[#9ca3af] text-[#111827]"
              placeholder="user@internal.company"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[#4b5563] ml-1 uppercase tracking-widest">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-[#d1d5db] rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-[#9ca3af] text-[#111827]"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isLogin ? (
              <LogIn className="w-5 h-5" />
            ) : (
              <UserPlus className="w-5 h-5" />
            )}
            {isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-[#f3f4f6] text-center flex flex-col items-center gap-4">
           <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors bg-transparent border-none cursor-pointer"
           >
             {isLogin ? "Need an account? Register here." : "Already have an account? Sign in."}
           </button>
           <p className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-[0.15em] flex items-center gap-2">
             <ShieldAlert className="w-3.5 h-3.5" />
             Enterprise-Grade Protection
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
