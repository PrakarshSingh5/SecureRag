import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Settings, 
  ShieldAlert, 
  History, 
  LogOut, 
  User, 
  ChevronRight,
  Shield,
  FileText,
  AlertCircle,
  Database,
  ArrowRight,
  Loader2,
  FileUp
} from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = 'http://localhost:8000';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', content: `Hello! I'm your SecureRAG assistant. I have access to **all** documents and can help you with your queries. How can I assist you today?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input, 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        logout();
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_URL}/chat/`,{
        method:"POST",
        headers:{
          "Content-type":"application/json",
          "Authorization":`Bearer ${token}`
        },
        body:JSON.stringify({
          query:userMessage.content
        })
      });

      // If token expired, redirect to login
      if (response.status === 401) {
        logout();
        navigate('/login');
        return;
      }

      const data = await response.json();
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: data.answer || data.response || "No response found.", 
        timestamp: new Date(),
        sources: data.sources || []
      }]);
      setIsTyping(false);
    } catch(error) {
      console.log(error);
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_URL}/chat/upload-resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const successMsg = { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: `✅ Successfully uploaded **${file.name}** and indexed ${response.data.chunks_indexed} chunks! You can now ask me questions about it.`, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, successMsg]);
      
    } catch (error) {
       console.error(error);
       const errorMsg = { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: `❌ Failed to upload ${file.name}: ${error.response?.data?.detail || error.message}`, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex justify-center h-screen bg-[#f3f4f6] overflow-hidden text-[#111827] font-sans selection:bg-blue-100 relative">
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0 h-full max-w-5xl w-full bg-white shadow-xl border-x border-[#e5e7eb]">
        {/* Header */}
        <header className="h-16 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-[15px] tracking-tight text-[#111827] flex items-center gap-2">
                SecureRAG
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-[#6b7280] font-medium tracking-wide">System Online</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-1.5 bg-[#f9fafb] px-3 py-1.5 rounded-md border border-[#e5e7eb] text-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-[#4b5563] font-medium tracking-wide">Open Access Mode</span>
             </div>
             
             {user?.role === 'admin' && (
              <button 
                onClick={() => window.location.href='/admin'} 
                className="px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#334155] border border-[#cbd5e1] rounded-md transition-all text-xs font-medium tracking-wide shadow-sm"
              >
                Admin Area
              </button>
             )}

             <div className="h-6 w-[1px] bg-[#e5e7eb] mx-1"></div>
             
             <div className="flex items-center gap-2 bg-[#f9fafb] px-2 py-1 rounded-md border border-[#e5e7eb]">
                <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-xs font-bold border border-[#e5e7eb] shadow-sm">
                  <User className="w-3.5 h-3.5 text-[#4b5563]" />
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-medium text-[#111827] max-w-[120px] truncate">{user?.email}</p>
                </div>
                <button onClick={logout} className="p-1 ml-1 text-[#6b7280] hover:text-red-500 hover:bg-[#f3f4f6] rounded-md transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
             </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-hide relative z-0 bg-[#f9fafb]">
          <div className="max-w-3xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                    message.role === 'ai' 
                      ? 'bg-blue-600 border border-blue-500' 
                      : 'bg-white border border-[#e5e7eb]'
                  }`}>
                    {message.role === 'ai' ? <Shield className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-[#4b5563]" />}
                  </div>
                  
                  <div className={`flex flex-col space-y-1.5 max-w-[85%] ${message.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                      message.role === 'ai' 
                        ? 'bg-white border border-[#e5e7eb] text-[#1f2937] rounded-tl-sm' 
                        : 'bg-blue-600 text-white border border-blue-500 rounded-tr-sm'
                    }`}>
                      <div className="chat-bubble-content font-normal tracking-wide">
                        {message.content.split('\n').map((para, i) => (
                           <p key={i} className={i > 0 ? "mt-3" : ""}>
                             {para.includes('⚠️') ? (
                               <span className="flex items-start gap-2 text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded">
                                 {para}
                               </span>
                             ) : para}
                           </p>
                        ))}
                      </div>
                      
                      {message.sources && message.role === 'ai' && message.id !== '1' && message.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#f3f4f6] flex flex-wrap gap-2">
                          <span className="text-[10px] text-[#9ca3af] font-bold uppercase tracking-widest w-full mb-1 flex items-center gap-1.5">
                            <Database className="w-3 h-3" /> Retrieved Context:
                          </span>
                          {message.sources.map((src, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f9fafb] rounded-md border border-[#e5e7eb] text-xs text-[#4b5563] cursor-help hover:bg-[#f3f4f6] transition-all">
                              <FileText className="w-3.5 h-3.5 text-blue-500" />
                              <span className="truncate max-w-[200px]">{src?.filename || src}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#9ca3af] font-medium uppercase tracking-wider px-1">
                       {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-4"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Shield className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-white border border-[#e5e7eb] shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-3">
                   <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                   </div>
                   <span className="text-xs text-[#6b7280] font-medium tracking-wide ml-1">SecureRAG is thinking...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-6" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#e5e7eb] pb-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-3 px-1">
               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f9fafb] rounded-md border border-[#e5e7eb] text-[10px] text-[#6b7280] font-medium uppercase tracking-widest">
                 <Database className="w-3 h-3 text-blue-500" />
                 All Internal Knowledge
               </span>
               <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#f9fafb] rounded-md border border-[#e5e7eb] text-[10px] text-[#6b7280] font-medium uppercase tracking-widest">
                 <FileUp className="w-3 h-3 text-blue-500" />
                 Upload Context Supported
               </span>
            </div>

            <form onSubmit={handleSend} className="relative group flex items-start gap-3">
              <input 
                 type="file" 
                 accept=".pdf" 
                 ref={fileInputRef}
                 onChange={handleFileUpload}
                 className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                title="Upload Resume or Context"
                className="shrink-0 h-12 w-12 bg-white hover:bg-[#f3f4f6] border border-[#e5e7eb] shadow-sm rounded-xl text-[#6b7280] transition-all flex items-center justify-center disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              </button>
              
              <div className="relative w-full flex bg-white border border-[#d1d5db] shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl transition-all">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Send a secure message...`}
                  className="w-full bg-transparent pl-4 pr-14 py-3.5 text-[14px] text-[#111827] focus:outline-none placeholder:text-[#9ca3af] font-normal"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-[#f3f4f6] disabled:text-[#9ca3af] text-white rounded-lg transition-all shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-[#9ca3af] mt-4 font-medium flex items-center justify-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              Secure interactions. AI guardrails are active.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
