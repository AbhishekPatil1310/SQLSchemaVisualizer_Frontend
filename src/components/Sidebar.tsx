import { useState, useEffect } from 'react';
import { Plus, Database, Server, Settings, LogOut, Loader2, Menu, X, Trash2, Sun, Moon } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { AddConnectionModal } from './AddConnectionModal';
import { toast } from 'sonner';

export const Sidebar = () => {
  const { connections, activeConn, refreshConnections, switchWorkspace, deleteConnection } = useWorkspace();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
      } md:translate-x-0 transition-transform duration-300 fixed md:relative w-full md:w-64 z-30 h-screen md:h-auto bg-white border-r border-slate-300 flex flex-col select-none dark:bg-sql-900 dark:border-sql-700`}>

        {/* Header */}
        <div className="p-3 md:p-6 border-b md:border-b-0 border-slate-300 dark:border-sql-700">
          <div className="flex items-center gap-2 mb-4 md:mb-8">
            <div className="bg-gradient-to-br from-sql-accent to-sql-accent2 p-1.5 rounded-lg shadow-lg shadow-sql-accent/20">
              <Server size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg md:text-xl text-slate-900 truncate dark:text-white">SQL Workspace</span>
          </div>

          {/* Connections Header */}
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connections</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
              connections.length >= 5 ? 'bg-sql-warning/20 text-amber-700 dark:bg-sql-warning/30 dark:text-sql-warning' : 'bg-slate-200 text-slate-700 dark:bg-sql-700 dark:text-slate-400'
            }`}>
              {connections.length}/5
            </span>
          </div>

          {/* Connections List */}
          <nav className="space-y-1 max-h-48 md:max-h-none overflow-y-auto">
            {connections.map((conn) => (
              <div key={conn.id} className="group relative flex items-center">

                {/* Main Button */}
                <button
                  onClick={() => {
                    handleWorkspaceSwitch(conn.id);
                    setIsMobileSidebarOpen(false);
                  }}
                  disabled={!!isSwitching}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs md:text-sm transition-all duration-200 ${
                    activeConn?.id === conn.id
                      ? 'bg-cyan-100 text-cyan-700 border border-cyan-300 shadow-sm dark:bg-sql-accent/10 dark:text-sql-accent dark:border-sql-accent/30'
                      : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-transparent dark:text-slate-400 dark:hover:bg-sql-800/50 dark:hover:text-slate-200'
                  }`}
                >
                  {isSwitching === conn.id ? (
                    <Loader2 size={16} className="animate-spin flex-shrink-0" />
                  ) : (
                    <Database size={16} className="flex-shrink-0" />
                  )}
                  <span className="truncate font-medium flex-1">{conn.label}</span>
                </button>

                {/* Delete Button (FIXED) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(conn.id);
                  }}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-sql-error/20 rounded text-slate-500 hover:text-sql-error"
                  title="Delete connection"
                >
                  <Trash2 size={14} />
                </button>

                {/* Delete Popup */}
                {deleteConfirm === conn.id && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-red-300 rounded-lg shadow-lg p-2 z-50 dark:bg-sql-800 dark:border-sql-error/50">
                    <p className="text-xs text-slate-700 mb-2 dark:text-slate-300">Delete "{conn.label}"?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDeleteConnection(conn.id)}
                        disabled={isDeleting === conn.id}
                        className="flex-1 px-2 py-1 text-xs bg-sql-error hover:bg-sql-error/90 disabled:bg-sql-error/50 text-white rounded"
                      >
                        {isDeleting === conn.id ? "Deleting..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 px-2 py-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-800 rounded dark:bg-sql-700 dark:hover:bg-sql-600 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}

            {/* Add Connection */}
            {connections.length < 5 && (
              <button 
                onClick={() => {
                  setIsModalOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs md:text-sm text-slate-600 border border-dashed border-slate-300 hover:border-sql-accent/50 hover:text-sql-accent transition-all mt-2 dark:text-slate-500 dark:border-sql-700 dark:hover:text-sql-accent/80"
              >
                <Plus size={16} />
                <span>Add Database</span>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto p-3 border-t border-slate-300 space-y-1 bg-slate-100 dark:border-sql-700 dark:bg-sql-800/30">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200 w-full rounded-lg text-xs md:text-sm dark:text-slate-300 dark:hover:text-white dark:hover:bg-sql-700/50"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span className="font-medium flex-1 text-left">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
            <span className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
              theme === 'light' ? 'bg-cyan-500' : 'bg-slate-500 dark:bg-sql-700'
            }`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === 'light' ? 'translate-x-5' : 'translate-x-1'
              }`} />
            </span>
          </button>

          <button className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-200 w-full rounded-lg text-xs md:text-sm dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-sql-700/50">
            <Settings size={16} />
            <span className="font-medium">Settings</span>
          </button>

          <button
            onClick={() => {
              logout();
              setIsMobileSidebarOpen(false);
            }}
            className="flex items-center gap-3 px-3 py-2 text-slate-700 hover:text-sql-error hover:bg-red-500/10 w-full rounded-lg text-xs md:text-sm dark:text-slate-400 dark:hover:bg-sql-error/5"
          >
            <LogOut size={16} />
            <span className="font-medium">Logout</span>
          </button>
        </div>

        <AddConnectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </aside>

      {/* Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-20 bg-black/50"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
    </>
  );
};
