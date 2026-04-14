import { useState, useEffect } from 'react';
import { Plus, Database, Server, Settings, LogOut, Loader2, Menu, X, Trash2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { AddConnectionModal } from './AddConnectionModal';
import { toast } from 'sonner';

export const Sidebar = () => {
  const { connections, activeConn, refreshConnections, switchWorkspace, deleteConnection } = useWorkspace();
  const { logout } = useAuth(); // Destructure logout function
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  const handleDeleteConnection = async (id: string) => {
    setIsDeleting(id);
    try {
      await deleteConnection(id);
      toast.success("Connection deleted successfully");
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete connection");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="md:hidden fixed bottom-4 left-4 z-40 p-3 rounded-lg bg-sql-accent text-white shadow-lg hover:bg-sql-accent/90 transition-all"
      >
        {isMobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 transition-transform duration-300 fixed md:relative w-full md:w-64 z-30 h-screen md:h-auto bg-sql-900 border-r border-sql-700 flex flex-col select-none`}>
        {/* Brand Header */}
        <div className="p-3 md:p-6 border-b md:border-b-0 border-sql-700 md:border-sql-700">
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
              <div key={conn.id} className="group relative">
                <button
                  onClick={() => {
                    handleWorkspaceSwitch(conn.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  disabled={!!isSwitching}
                  className={`w-full flex items-center gap-3 px-2.5 md:px-3 py-2 md:py-2 rounded-lg text-xs md:text-sm transition-all duration-200 group ${
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
                  <span className="truncate font-medium flex-1">{conn.label}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(conn.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 hover:bg-sql-error/20 rounded text-slate-500 hover:text-sql-error flex-shrink-0"
                    title="Delete connection"
                  >
                    <Trash2 size={14} />
                  </button>
                </button>

                {/* Delete Confirmation Popup */}
                {deleteConfirm === conn.id && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-sql-800 border border-sql-error/50 rounded-lg shadow-lg p-2 z-50">
                    <p className="text-xs text-slate-300 mb-2">Delete "{conn.label}"?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteConnection(conn.id)}
                        disabled={isDeleting === conn.id}
                        className="flex-1 px-2 py-1 text-xs bg-sql-error hover:bg-sql-error/90 disabled:bg-sql-error/50 text-white rounded transition-colors"
                      >
                        {isDeleting === conn.id ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 px-2 py-1 text-xs bg-sql-700 hover:bg-sql-600 text-slate-300 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Connection Trigger */}
            {connections.length < 5 && (
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-2.5 md:px-3 py-2 rounded-lg text-xs md:text-sm text-slate-500 border border-dashed border-sql-700 hover:border-sql-accent/50 hover:text-sql-accent/80 transition-all mt-2 group"
              >
                <Plus size={16} className="group-hover:scale-110 transition-transform flex-shrink-0" />
                <span>Add Database</span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Actions Section */}
        <div className="mt-auto p-2.5 md:p-4 border-t border-sql-700 space-y-1 bg-sql-800/30">
          <button className="flex items-center gap-3 px-2.5 md:px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-sql-700/50 transition-all w-full rounded-lg text-xs md:text-sm">
            <Settings size={16} className="md:w-[18px] md:h-[18px] flex-shrink-0" />
            <span className="font-medium">Settings</span>
          </button>

          <button
            onClick={() => {
              logout();
              setIsMobileSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-2.5 md:px-3 py-2 text-slate-400 hover:text-sql-error hover:bg-sql-error/5 transition-all w-full rounded-lg group text-xs md:text-sm"
          >
            <LogOut size={16} className="md:w-[18px] md:h-[18px] group-hover:-translate-x-1 transition-transform flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        <AddConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </>
  );
};