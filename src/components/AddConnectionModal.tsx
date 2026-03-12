import { useState } from 'react';
import { X, Database, Link2 } from 'lucide-react';
import api from '../lib/api';
import { useWorkspace } from '../context/WorkspaceContext';
import { toast } from 'sonner';

export const AddConnectionModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const { refreshConnections } = useWorkspace();

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/workspace/add', { label, url });
      await refreshConnections();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save connection");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
      <div className="bg-sql-900 border border-sql-700 w-full max-w-md rounded-xl md:rounded-2xl shadow-2xl overflow-hidden animate-in max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-5 border-b border-sql-700 flex justify-between items-center bg-sql-800/70 sticky top-0">
          <h2 className="text-base md:text-lg font-semibold flex items-center gap-2 min-w-0">
            <Database size={18} className="text-sql-accent flex-shrink-0" /> 
            <span className="truncate">Add Connection</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-sql-accent transition flex-shrink-0">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSave} className="p-4 md:p-6 space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-xs font-semibold text-slate-400 uppercase mb-1.5 md:mb-2 tracking-wide">Connection Name</label>
            <input 
              required
              placeholder="e.g., Production DB"
              className="w-full bg-sql-950 border border-sql-700 rounded-lg p-2 md:p-2.5 outline-none focus:border-sql-accent focus:ring-1 focus:ring-sql-accent/30 transition text-slate-200 placeholder-slate-600 text-xs md:text-base"
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs md:text-xs font-semibold text-slate-400 uppercase mb-1.5 md:mb-2 tracking-wide">Connection URL</label>
            <div className="relative">
              <Link2 size={16} className="absolute left-3 top-2.5 md:top-3 text-slate-500 flex-shrink-0" />
              <input 
                required
                type="password"
                placeholder="postgres://user:pass@host:port/db"
                className="w-full bg-sql-950 border border-sql-700 rounded-lg p-2 md:p-2.5 pl-9 md:pl-10 outline-none focus:border-sql-accent focus:ring-1 focus:ring-sql-accent/30 transition text-slate-200 placeholder-slate-600 text-xs md:text-base"
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-sql-accent2 to-sql-accent3 hover:from-sql-accent2/90 hover:to-sql-accent3/90 py-2 md:py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl text-white text-xs md:text-base mt-4 md:mt-6">
            Connect
          </button>
        </form>
      </div>
    </div>
  );
};