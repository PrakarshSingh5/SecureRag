import React, { useState } from 'react';
import axios from 'axios';
import { 
  FileUp, 
  Trash2, 
  Search, 
  ArrowUpRight,
  Database,
  SearchCheck,
  Zap,
  AlignLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

const API_URL = 'http://localhost:8000';

const AdminDocumentsPage = () => {
  const [activeRoleTab, setActiveRoleTab] = useState('engineering');
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Tab 1 state: PDF Upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [pdfRole, setPdfRole] = useState('engineering');

  // Tab 2 state: Text Knowledge
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');
  const [textRole, setTextRole] = useState('engineering');

  const [recentUploads, setRecentUploads] = useState([
    { id: 1, name: 'Eng-Ops-V2.pdf', role: 'engineering', size: '1.2 MB', status: 'Indexed' },
    { id: 2, name: 'Fiscal-2024-Q1.xlsx', role: 'finance', size: '450 KB', status: 'Processing' },
    { id: 3, name: 'Hiring-Guide.docx', role: 'hr', size: '890 KB', status: 'Indexed' },
  ]);

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedFile) {
      setErrorMsg('Please select a PDF file to upload.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('role', pdfRole);

    try {
      const response = await axios.post(`${API_URL}/admin/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccessMsg(`Successfully indexed ${response.data.chunks_indexed || 0} chunks from ${selectedFile.name}`);
      setSelectedFile(null); // Reset
      // Mock add to list
      setRecentUploads(prev => [{
        id: Date.now(),
        name: selectedFile.name,
        role: pdfRole,
        size: 'Just added',
        status: 'Indexed'
      }, ...prev]);
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!textTitle.trim() || !textContent.trim()) {
      setErrorMsg('Please provide both a title and content.');
      return;
    }

    setIsUploading(true);
    
    try {
      const response = await axios.post(`${API_URL}/admin/add-text`, {
        title: textTitle,
        content: textContent,
        role: textRole
      });
      
      setSuccessMsg(`Successfully indexed knowledge: "${textTitle}"`);
      setTextTitle('');
      setTextContent('');
      // Mock add to list
      setRecentUploads(prev => [{
        id: Date.now(),
        name: `${textTitle} (Text snippet)`,
        role: textRole,
        size: 'Snippet',
        status: 'Indexed'
      }, ...prev]);
    } catch (err) {
      // It might fail if /admin/add-text is not implemented on backend yet
      setErrorMsg(err.response?.data?.detail || 'An error occurred while adding text (Backend endpoint may be missing).');
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = (id) => {
      setRecentUploads(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <>
      <header className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold mb-1">Knowledge Management</h2>
          <p className="text-[#94a3b8]">Upload documents or input text to expand the RAG knowledge base.</p>
        </div>
      </header>

      {/* Notifications */}
      {errorMsg && (
        <div className="mb-6 bg-rose-500/10 border border-rose-500/50 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}
      {successMsg && (
        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{successMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Upload / Add Knowledge Column */}
         <div className="lg:col-span-1 space-y-8">
            <section className="bg-[#1e293b] border border-[#334155] p-6 rounded-2xl shadow-xl">
               <Tabs defaultValue="pdf">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="pdf" className="flex items-center gap-2 text-xs">
                      <FileUp className="w-3.5 h-3.5" /> Upload PDF
                    </TabsTrigger>
                    <TabsTrigger value="text" className="flex items-center gap-2 text-xs">
                       <AlignLeft className="w-3.5 h-3.5" /> Add Text
                    </TabsTrigger>
                  </TabsList>

                  {/* PDF TAB CONTENT */}
                  <TabsContent value="pdf" className="space-y-4">
                     <form onSubmit={handlePdfSubmit}>
                       <div className="mb-4">
                          <label className="text-xs font-bold text-[#64748b] uppercase px-1 mb-1 block">File Selection</label>
                          <div className="border-2 border-dashed border-[#334155] hover:border-blue-500/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-[#0f172a]/50 relative overflow-hidden group">
                             <input 
                               type="file" 
                               accept=".pdf" 
                               onChange={(e) => setSelectedFile(e.target.files[0])}
                               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                             />
                             <div className="p-3 bg-blue-500/10 rounded-full mb-2 group-hover:bg-blue-500/20 transition-colors">
                                <FileUp className="w-6 h-6 text-blue-400" />
                             </div>
                             <p className="text-sm font-medium text-[#f8fafc] text-center mb-1">
                               {selectedFile ? selectedFile.name : "Click or drag to select PDF"}
                             </p>
                             <p className="text-[10px] text-[#475569] uppercase font-bold tracking-widest">
                               {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF ONLY"}
                             </p>
                          </div>
                       </div>
                       
                       <div className="space-y-1.5 mb-6">
                          <label className="text-xs font-bold text-[#64748b] uppercase px-1">Assign Access Role</label>
                          <select 
                            value={pdfRole}
                            onChange={(e) => setPdfRole(e.target.value)}
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-white"
                          >
                             <option value="engineering">Engineering</option>
                             <option value="finance">Finance</option>
                             <option value="hr">Human Resources</option>
                             <option value="admin">Admin</option>
                          </select>
                       </div>

                       <button 
                         type="submit"
                         disabled={isUploading || !selectedFile}
                         className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-[#334155] disabled:text-[#94a3b8] disabled:cursor-not-allowed"
                       >
                         {isUploading ? <Zap className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                         {isUploading ? 'Indexing Chunks...' : 'Push to Knowledge Base'}
                       </button>
                     </form>
                  </TabsContent>

                  {/* TEXT TAB CONTENT */}
                  <TabsContent value="text" className="space-y-4">
                     <form onSubmit={handleTextSubmit}>
                        <div className="space-y-1.5 mb-4">
                           <label className="text-xs font-bold text-[#64748b] uppercase px-1">Knowledge Title</label>
                           <input 
                              type="text" 
                              value={textTitle}
                              onChange={(e) => setTextTitle(e.target.value)}
                              placeholder="e.g. Q4 Company Goals"
                              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-[#475569]"
                           />
                        </div>

                        <div className="space-y-1.5 mb-4">
                           <label className="text-xs font-bold text-[#64748b] uppercase px-1">Knowledge Content</label>
                           <textarea 
                              value={textContent}
                              onChange={(e) => setTextContent(e.target.value)}
                              placeholder="Type the knowledge content here. This text will be embedded into the vector database directly."
                              rows={5}
                              className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none text-white placeholder:text-[#475569]"
                           />
                        </div>

                        <div className="space-y-1.5 mb-6">
                          <label className="text-xs font-bold text-[#64748b] uppercase px-1">Assign Access Role</label>
                          <select 
                            value={textRole}
                            onChange={(e) => setTextRole(e.target.value)}
                            className="w-full bg-[#0f172a] border border-[#334155] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-white"
                          >
                             <option value="engineering">Engineering</option>
                             <option value="finance">Finance</option>
                             <option value="hr">Human Resources</option>
                             <option value="admin">Admin</option>
                          </select>
                       </div>

                       <button 
                         type="submit"
                         disabled={isUploading || !textTitle.trim() || !textContent.trim()}
                         className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:bg-[#334155] disabled:text-[#94a3b8] disabled:cursor-not-allowed"
                       >
                         {isUploading ? <Zap className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                         {isUploading ? 'Indexing Text...' : 'Embed Knowledge Chunk'}
                       </button>
                     </form>
                  </TabsContent>
               </Tabs>
            </section>
         </div>

         {/* Document Table */}
         <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#1e293b] border border-[#334155] rounded-2xl shadow-xl overflow-hidden">
               <div className="p-6 border-b border-[#334155] flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <h3 className="text-lg font-bold">Document Management</h3>
                  <div className="relative">
                     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                     <input 
                        type="text" 
                        placeholder="Search indexed files..." 
                        className="bg-[#0f172a] border border-[#334155] rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 w-full md:w-64"
                     />
                  </div>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead className="bg-[#0f172a]/50 text-[10px] uppercase font-bold text-[#64748b] tracking-widest border-b border-[#334155]">
                        <tr>
                           <th className="px-6 py-4">Knowledge Source</th>
                           <th className="px-6 py-4">Access Role</th>
                           <th className="px-6 py-4">Size</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-[#334155]">
                        {recentUploads.map((file) => (
                           <tr key={file.id} className="hover:bg-[#0f172a]/30 transition-colors">
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#0f172a] rounded-lg">
                                       {file.name.includes('(Text') ? (
                                         <AlignLeft className="w-4 h-4 text-purple-400" />
                                       ) : (
                                         <SearchCheck className="w-4 h-4 text-blue-400" />
                                       )}
                                    </div>
                                    <span className="text-sm font-medium">{file.name}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    file.role === 'engineering' ? 'bg-blue-500/10 text-blue-400' :
                                    file.role === 'finance' ? 'bg-emerald-500/10 text-emerald-400' :
                                    file.role === 'hr' ? 'bg-purple-500/10 text-purple-400' : 'bg-[#334155] text-[#94a3b8]'
                                 }`}>
                                    {file.role}
                                 </span>
                              </td>
                              <td className="px-6 py-4 text-xs text-[#94a3b8]">{file.size}</td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${file.status === 'Indexed' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500 animate-pulse'}`}></div>
                                    <span className="text-xs font-medium">{file.status}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <button 
                                   onClick={() => deleteDocument(file.id)}
                                   title="Remove from knowledge base"
                                   className="p-2 hover:bg-rose-500/10 rounded-lg text-[#64748b] hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20"
                                 >
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </td>
                           </tr>
                        ))}
                        {recentUploads.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-[#64748b] text-sm md:text-md">
                              No knowledge documents found.
                            </td>
                          </tr>
                        )}
                     </tbody>
                  </table>
               </div>
               {recentUploads.length > 0 && (
                 <div className="p-4 bg-[#0f172a]/30 border-t border-[#334155] flex justify-center">
                    <button className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors">
                       View All Documents
                       <ArrowUpRight className="w-3 h-3" />
                    </button>
                 </div>
               )}
            </div>
         </div>
      </div>
    </>
  );
};

export default AdminDocumentsPage;
