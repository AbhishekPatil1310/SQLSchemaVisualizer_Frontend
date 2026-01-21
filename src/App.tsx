import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SqlEditor } from './components/SqlEditor';
import { ResultSection } from './components/ResultSection';
import { SchemaVisualizer } from './components/Visualizer';
import { executeSql, fetchSchema } from './lib/query';
import type { QueryResponse } from './lib/query';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Table, Layout } from 'lucide-react';

function App() {
  const [sql, setSql] = useState("SELECT * FROM users LIMIT 10;");
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'visual'>('data');
  const { isAuthenticated } = useAuth();

  // If not logged in, show AuthPage
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const handleRunQuery = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    setResults(null);
    setActiveTab('data'); // Switch to data tab when running a query

    try {
      const data = await executeSql(sql, 'table'); 
      setResults(data);
    } catch (err: any) {
      const serverError = err.response?.data;
      const errorMessage = serverError?.details || serverError?.error || err.message || "Query failed";
      alert(`Query Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewSchema = async () => {
    setLoading(true);
    setActiveTab('visual');
    try {
      const data = await fetchSchema();
      setSchemaData(data);
    } catch (err: any) {
      alert("Failed to fetch database schema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-sql-950 text-slate-200">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Section: Editor */}
        <div className="flex-1 min-h-0 relative flex flex-col md:h-1/2">
          <SqlEditor 
            code={sql} 
            onChange={(val) => setSql(val || "")} 
            onExecute={handleRunQuery}
            isLoading={loading}
          />
        </div>

        {/* Bottom Section: Tabs & Content */}
        <div className="flex-1 min-h-0 border-t border-sql-700 bg-sql-900 flex flex-col md:h-1/2">
          {/* Tab Bar */}
          <div className="flex items-center gap-2 md:gap-4 px-3 md:px-4 py-2.5 bg-sql-800/50 border-b border-sql-700 flex-wrap">
            <button 
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1.5 md:gap-2 text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'data' 
                  ? 'text-sql-accent border-b-2 border-sql-accent pb-2.5' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table size={14} /> <span className="hidden sm:inline">DATA RESULTS</span>
            </button>
            <button 
              onClick={handleViewSchema}
              className={`flex items-center gap-1.5 md:gap-2 text-xs font-semibold transition whitespace-nowrap ${
                activeTab === 'visual' 
                  ? 'text-sql-accent border-b-2 border-sql-accent pb-2.5' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layout size={14} /> <span className="hidden sm:inline">VISUAL SCHEMA</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'data' ? (
              <ResultSection results={results} />
            ) : (
              schemaData ? (
                <SchemaVisualizer data={schemaData} />
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                  {loading ? "Mapping database relationships..." : "Click 'Visual Schema' to generate ERD"}
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;