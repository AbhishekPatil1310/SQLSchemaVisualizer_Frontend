import { createContext, useContext, useState } from 'react';
import api from '../lib/api';

interface Connection {
  id: string;
  label: string;
  is_active: boolean;
}

interface WorkspaceContextType {
  connections: Connection[];
  activeConn: Connection | null;
  refreshConnections: () => Promise<void>;
  switchWorkspace: (id: string) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider = ({ children }: { children: React.ReactNode }) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [activeConn, setActiveConn] = useState<Connection | null>(null);

  const refreshConnections = async () => {
    const { data } = await api.get('/workspace/list');
    setConnections(data);
    setActiveConn(data.find((c: Connection) => c.is_active) || null);
  };

  const switchWorkspace = async (connectionId: string) => {
    await api.post('/workspace/switch', { connectionId });
    await refreshConnections();
  };

  const deleteConnection = async (connectionId: string) => {
    await api.delete(`/workspace/delete/${connectionId}`);
    await refreshConnections();
  };

  return (
    <WorkspaceContext.Provider value={{ connections, activeConn, refreshConnections, switchWorkspace, deleteConnection }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return context;
};