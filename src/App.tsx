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
import { AIQueryInput } from './components/AIQueryInput';
import { QueryPreviewPanel } from './components/QueryPreviewPanel';
import { SchemaSummary } from './components/SchemaSummary';
import { AIStatistics } from './components/AIStatistics';

function App() {
  const [sql, setSql] = useState("SELECT * FROM users LIMIT 10;");
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'visual'>('data');
  const [databaseType, setDatabaseType] = useState<'postgres' | 'mysql'>('postgres');
  const [generatedQuery, setGeneratedQuery] = useState<{ query: string; explanation: string } | null>(null);
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
    <div className="flex h-screen overflow-hidden bg-sql-950 text-slate-200 flex-col md:flex-row">
      <Sidebar />
      
      <main className="flex-1 flex flex-col min-w-0 w-full">
        {/* Top Section: Editor */}
        <div className="flex-1 min-h-0 relative flex flex-col md:h-1/2 min-h-32 md:min-h-0">
          <SqlEditor 
            code={sql} 
            onChange={(val) => setSql(val || "")} 
            onExecute={handleRunQuery}
            isLoading={loading}
          />
        </div>

        {/* Bottom Section: Tabs & Content */}
        <div className="flex-1 min-h-0 border-t border-sql-700 bg-sql-900 flex flex-col md:h-1/2 min-h-32 md:min-h-0">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 md:gap-4 px-2 md:px-4 py-2 md:py-2.5 bg-sql-800/50 border-b border-sql-700 flex-wrap overflow-x-auto">
            <button 
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm font-semibold transition whitespace-nowrap py-2 px-2 md:px-0 rounded md:rounded-none ${
                activeTab === 'data' 
                  ? 'text-sql-accent border-b-2 md:border-b-2 border-sql-accent md:pb-2.5' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-sql-700/30 md:hover:bg-transparent'
              }`}
            >
              <Table size={14} className="flex-shrink-0" /> <span>Data</span>
            </button>
            <button 
              onClick={handleViewSchema}
              className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm font-semibold transition whitespace-nowrap py-2 px-2 md:px-0 rounded md:rounded-none ${
                activeTab === 'visual' 
                  ? 'text-sql-accent border-b-2 md:border-b-2 border-sql-accent md:pb-2.5' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-sql-700/30 md:hover:bg-transparent'
              }`}
            >
              <Layout size={14} className="flex-shrink-0" /> <span>Schema</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden w-full">
            {activeTab === 'data' ? (
              <ResultSection results={results} />
            ) : (
              schemaData ? (
                <div className="grid h-full gap-2 p-2 md:grid-cols-3 md:gap-3 md:p-3">
                  <div className="space-y-2 overflow-y-auto md:col-span-1">
                    <div className="rounded-md border border-sql-700 bg-sql-800/40 p-2">
                      <label className="mb-1 block text-[11px] text-slate-300">Database Type</label>
                      <select
                        value={databaseType}
                        onChange={(event) => setDatabaseType(event.target.value as 'postgres' | 'mysql')}
                        className="w-full rounded-md border border-sql-700 bg-sql-900 px-2 py-1 text-xs text-slate-200"
                      >
                        <option value="postgres">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                      </select>
                    </div>
                    <AIQueryInput
                      databaseType={databaseType}
                      onQueryGenerated={(query, explanation) => setGeneratedQuery({ query, explanation })}
                    />
                    {generatedQuery ? (
                      <QueryPreviewPanel
                        query={generatedQuery.query}
                        explanation={generatedQuery.explanation}
                        databaseType={databaseType}
                      />
                    ) : null}
                    <SchemaSummary databaseType={databaseType} />
                    <AIStatistics />
                  </div>
                  <div className="min-h-[320px] overflow-hidden rounded-md border border-sql-700 md:col-span-2">
                    <SchemaVisualizer data={schemaData} />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-xs md:text-sm italic px-4 text-center">
                  {loading ? "Mapping database relationships..." : "Click 'Schema' to generate ERD"}
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
