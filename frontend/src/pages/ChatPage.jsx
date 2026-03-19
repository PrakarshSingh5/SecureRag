import React, { useState, useEffect, useRef } from 'react';
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
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ChatPage = () => {
  const { user, logout } = useAuth();
  const [messages, setMessages] = useState([
    { id: '1', role: 'ai', content: `Hello! I'm your SecureRAG assistant. I have access to **${user?.role}** documents and can help you with your queries. How can I assist you today?`, timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

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

    // Simulate RAG + AI processing
    setTimeout(() => {
      const response = generateMockResponse(input, user?.role);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'ai', 
        content: response, 
        timestamp: new Date(),
        sources: ['doc_123.pdf', 'policy_v2.docx'] // Mock sources
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (query, role) => {
    // Guardrail simulation
    if (query.toLowerCase().includes('salary') || query.toLowerCase().includes('confidential')) {
      return "⚠️ **Guardrail Triggered**: Access to sensitive data like salaries is restricted. Please contact HR for official inquiries.";
    }
    
    switch(role) {
      case 'engineering':
        return "Based on the technical documentation, our current microservices architecture uses gRPC for inter-service communication. You can find more details in the `Arch-2024.pdf` document.";
      case 'finance':
        return "The Q4 financial projections indicate a 15% increase in operational efficiency. This data is retrieved from the `Fiscal-Reports-Q4.xlsx` source.";
      default:
        return "I've searched the available internal documents. Could you please specify which project or department this query relates to?";
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden text-[#f8fafc]">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="bg-[#1e293b] border-r border-[#334155] flex flex-col relative z-20 shrink-0"
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">SecureRAG</span>
          </div>
        </div>

        <button className="mx-4 mt-2 flex items-center justify-center gap-2 bg-[#0f172a] hover:bg-blue-600 border border-[#334155] rounded-lg py-2.5 transition-all group">
          <Plus className="w-4 h-4 text-blue-400 group-hover:text-white transition-colors" />
          <span className="font-medium text-sm">New Conversation</span>
        </button>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3 px-1">Recent Chats</h3>
            <div className="space-y-1">
              {['API Integration Help', 'Security Policy Review', 'Quarterly Goals'].map((chat, i) => (
                <button key={i} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0f172a]/50 text-[#94a3b8] hover:text-white transition-all text-sm text-left group">
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-50 group-hover:opacity-100" />
                  <span className="truncate">{chat}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3 px-1">Internal Documents</h3>
            <div className="space-y-1">
               <div className="flex items-center gap-3 px-3 py-2 text-sm text-[#4d7c0f] bg-[#4d7c0f]/10 rounded-lg border border-[#4d7c0f]/20">
                 <Database className="w-4 h-4" />
                 <span>{(user?.role || '').toUpperCase()} Documents</span>
               </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#334155] space-y-3">
          {user?.role === 'admin' && (
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#0f172a] text-[#f59e0b] transition-all text-sm font-medium">
              <Settings className="w-4 h-4" />
              Admin Dashboard
            </button>
          )}
          <div className="flex items-center justify-between bg-[#0f172a]/30 p-2 rounded-xl backdrop-blur-sm border border-[#334155]/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold border border-white/10 shadow-lg">
                <User className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate max-w-[120px]">{user?.email}</p>
                <p className="text-[10px] text-[#64748b] uppercase tracking-tighter">{user?.role}</p>
              </div>
            </div>
            <button onClick={logout} className="p-2 text-[#64748b] hover:text-red-400 transition-colors bg-[#0f172a] rounded-lg border border-[#334155]">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-[#334155] bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#1e293b] rounded-lg transition-colors text-[#94a3b8] md:block hidden"
            >
              <History className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                Secure Session 
                <span className="inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden lg:flex items-center gap-2 bg-[#1e293b] px-3 py-1.5 rounded-full border border-[#334155] text-xs">
                <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[#94a3b8]">RBAC Filtering Enabled</span>
             </div>
             <div className="h-8 w-[1px] bg-[#334155] mx-1"></div>
             <button className="p-2 hover:bg-[#1e293b] rounded-lg transition-colors text-[#94a3b8]">
               <Settings className="w-5 h-5" />
             </button>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 space-y-8 scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                    message.role === 'ai' 
                      ? 'bg-blue-600 border border-blue-400/30' 
                      : 'bg-[#1e293b] border border-[#334155]'
                  }`}>
                    {message.role === 'ai' ? <Shield className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
                  </div>
                  
                  <div className={`flex flex-col space-y-2 max-w-[80%] ${message.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-xl ${
                      message.role === 'ai' 
                        ? 'bg-[#1e293b] border border-[#334155] text-white' 
                        : 'bg-blue-600 text-white border border-blue-400/20'
                    }`}>
                      <div className="chat-bubble-content">
                        {message.content.split('\n').map((para, i) => (
                           <p key={i} className={i > 0 ? "mt-3" : ""}>
                             {para.includes('⚠️') ? (
                               <span className="flex items-start gap-2 text-amber-400 italic">
                                 {para}
                               </span>
                             ) : para}
                           </p>
                        ))}
                      </div>
                      
                      {message.sources && (
                        <div className="mt-4 pt-4 border-t border-[#334155] flex flex-wrap gap-2">
                          <span className="text-[10px] text-[#64748b] font-bold uppercase tracking-widest w-full mb-1">Retrieval Sources:</span>
                          {message.sources.map((src, i) => (
                            <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0f172a] rounded-md border border-[#334155] text-xs text-blue-400 cursor-help hover:border-blue-500/50 transition-colors">
                              <FileText className="w-3 h-3" />
                              {src}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-[#475569] font-medium uppercase px-2">
                       {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 animate-pulse">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="bg-[#1e293b] border border-[#334155] px-6 py-4 rounded-2xl flex items-center gap-3">
                   <div className="flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></div>
                   </div>
                   <span className="text-xs text-[#64748b] font-medium">Analyzing documents...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent">
          <div className="max-w-4xl mx-auto">
            {/* Context chip */}
            <div className="flex items-center gap-2 mb-3 ml-2">
               <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20 text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                 <Database className="w-3 h-3" />
                 {user?.role} context
               </span>
               <span className="h-1 w-1 rounded-full bg-[#334155]"></span>
               <span className="text-[10px] text-[#64748b] font-medium uppercase">Claude 3.5 Sonnet Integration</span>
            </div>

            <form onSubmit={handleSend} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask about ${user?.role} specific documents...`}
                className="w-full bg-[#1e293b] border border-[#334155] focus:border-blue-500/50 rounded-2xl pl-6 pr-16 py-5 focus:outline-none focus:ring-4 focus:ring-blue-500/5 shadow-2xl transition-all placeholder:text-[#475569]"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-[#334155] disabled:cursor-not-allowed rounded-xl text-white transition-all shadow-lg shadow-blue-600/20 active:scale-95 group-hover:scale-105"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-center text-[10px] text-[#475569] mt-4 font-medium uppercase tracking-widest">
              Security Notice: All interactions are logged for compliance and safety.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
