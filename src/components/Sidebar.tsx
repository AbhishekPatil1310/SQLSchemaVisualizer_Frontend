import { useState, useEffect } from 'react';
import { Plus, Database, Server, Settings, LogOut, Loader2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { AddConnectionModal } from './AddConnectionModal';

export const Sidebar = () => {
  const { connections, activeConn, refreshConnections, switchWorkspace } = useWorkspace();
  const { logout } = useAuth(); // Destructure logout function
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  useEffect(() => {
    refreshConnections();
  }, []);

  const handleWorkspaceSwitch = async (id: string) => {
    if (id === activeConn?.id) return;
    setIsSwitching(id);
    try {
      await switchWorkspace(id);
    } finally {
      setIsSwitching(null);
    }
  };

  return (
    <aside className="w-full md:w-64 bg-sql-900 border-r border-sql-700 flex flex-col h-screen select-none">
      {/* Brand Header */}
      <div className="p-3 md:p-6">
        <div className="flex items-center gap-2 mb-4 md:mb-8">
          <div className="bg-gradient-to-br from-sql-accent to-sql-accent2 p-1.5 rounded-lg shadow-lg shadow-sql-accent/20">
            <Server size={18} className="md:w-5 md:h-5 text-white" />
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-white truncate">SQL Workspace</span>
        </div>

        {/* Workspaces Section */}
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connections</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
            connections.length >= 5 ? 'bg-sql-warning/30 text-sql-warning' : 'bg-sql-700 text-slate-400'
          }`}>
            {connections.length}/5
          </span>
        </div>

        <nav className="space-y-1 max-h-48 md:max-h-none overflow-y-auto">
          {connections.map((conn) => (
            <button
              key={conn.id}
              onClick={() => handleWorkspaceSwitch(conn.id)}
              disabled={!!isSwitching}
              className={`w-full flex items-center gap-3 px-2.5 md:px-3 py-2 rounded-lg text-xs md:text-sm transition-all duration-200 group ${
                activeConn?.id === conn.id 
                ? 'bg-sql-accent/10 text-sql-accent border border-sql-accent/30 shadow-sm' 
                : 'text-slate-400 hover:bg-sql-800/50 hover:text-slate-200 border border-transparent'
              }`}
            >
              {isSwitching === conn.id ? (
                <Loader2 size={16} className="animate-spin flex-shrink-0" />
              ) : (
                <Database size={16} className={`flex-shrink-0 ${activeConn?.id === conn.id ? 'text-sql-accent' : 'group-hover:text-slate-300'}`} />
              )}
              <span className="truncate font-medium hidden md:inline">{conn.label}</span>
              <span className="truncate font-medium md:hidden text-[10px]">{conn.label.substring(0, 15)}</span>
            </button>
          ))}

          {/* Add Connection Trigger */}
          {connections.length < 5 && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center gap-3 px-2.5 md:px-3 py-2 rounded-lg text-xs md:text-sm text-slate-500 border border-dashed border-sql-700 hover:border-sql-accent/50 hover:text-sql-accent/80 transition-all mt-2 group"
            >
              <Plus size={16} className="group-hover:scale-110 transition-transform flex-shrink-0" />
              <span className="hidden md:inline">Add Database</span>
              <span className="md:hidden text-[10px]">Add</span>
            </button>
          )}
        </nav>
      </div>

      {/* Bottom Actions Section */}
      <div className="mt-auto p-2.5 md:p-4 border-t border-sql-700 space-y-1 bg-sql-800/30">
        <button className="flex items-center gap-3 px-2.5 md:px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-sql-700/50 transition-all w-full rounded-lg text-xs md:text-sm">
          <Settings size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
          <span className="font-medium hidden md:inline">Settings</span>
        </button>
        
        <button 
          onClick={logout}
          className="flex items-center gap-3 px-2.5 md:px-3 py-2 text-slate-400 hover:text-sql-error hover:bg-sql-error/5 transition-all w-full rounded-lg group text-xs md:text-sm"
        >
          <LogOut size={16} className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform flex-shrink-0" />
          <span className="font-medium hidden md:inline">Logout</span>
        </button>
      </div>

      <AddConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </aside>
  );
};