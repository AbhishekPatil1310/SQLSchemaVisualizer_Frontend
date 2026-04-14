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
import { Toaster } from './components/ui/sonner';
import { NotesSection } from './components/NotesSection';
import { toast } from 'sonner';
import { BookText } from 'lucide-react';
import { useWorkspace } from './context/WorkspaceContext';

function App() {
  const [sql, setSql] = useState("SELECT * FROM users LIMIT 10;");
  const [results, setResults] = useState<QueryResponse | null>(null);
  const [schemaData, setSchemaData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'visual' | 'notes'>('data');
  const [databaseType, setDatabaseType] = useState<'postgres' | 'mysql'>('postgres');
  const [generatedQuery, setGeneratedQuery] = useState<{ query: string; explanation: string } | null>(null);
  const { isAuthenticated } = useAuth();
  const { activeConn } = useWorkspace();

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
      (`Query Error: ${errorMessage}`);
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
      toast.error("Failed to fetch database schema.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-sql-950 dark:text-slate-200">
      <Toaster />
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 w-full md:ml-0">
        {/* Top Section: Editor */}
        <div className="h-1/2 min-h-[200px] md:h-1/2 flex flex-col">
          <SqlEditor
            code={sql}
            onChange={(val) => setSql(val || "")}
            onExecute={handleRunQuery}
            isLoading={loading}
          />
        </div>

        {/* Bottom Section: Tabs & Content */}
        <div className="h-1/2 min-h-[200px] md:h-1/2 border-t border-slate-300 bg-white flex flex-col dark:border-sql-700 dark:bg-sql-900">
          {/* Tab Bar */}
          <div className="flex items-center gap-1 px-2 py-2 bg-slate-200/70 border-b border-slate-300 overflow-x-auto scrollbar-hide dark:bg-sql-800/50 dark:border-sql-700">
            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center gap-1 text-xs font-semibold transition whitespace-nowrap py-2 px-2 rounded ${activeTab === 'data'
                  ? 'text-sql-accent border-b-2 border-sql-accent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-sql-700/30'
                }`}
            >
              <Table size={14} className="flex-shrink-0" /> <span className="hidden xs:inline">Data</span>
            </button>
            <button
              onClick={handleViewSchema}
              className={`flex items-center gap-1 text-xs font-semibold transition whitespace-nowrap py-2 px-2 rounded ${activeTab === 'visual'
                  ? 'text-sql-accent border-b-2 border-sql-accent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-sql-700/30'
                }`}
            >
              <Layout size={14} className="flex-shrink-0" /> <span className="hidden xs:inline">Schema</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex items-center gap-1 text-xs font-semibold transition whitespace-nowrap py-2 px-2 rounded ${activeTab === 'notes'
                  ? 'text-sql-accent border-b-2 border-sql-accent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-sql-700/30'
                }`}
            >
              <BookText size={14} className="flex-shrink-0" /> <span className="hidden xs:inline">Notes</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden w-full">
            {activeTab === 'data' ? (
              <ResultSection results={results} />
            ) : activeTab === 'notes' ? (
              <NotesSection connectionId={activeConn?.id ?? null} />
            ) : (
              schemaData ? (
                <div className="h-full flex flex-col lg:grid lg:grid-cols-3 gap-2 p-2 lg:gap-3 lg:p-3">
                  <div className="flex flex-col gap-2 overflow-y-auto lg:col-span-1 min-h-0 flex-1 lg:max-h-none">
                    <div className="rounded-md border border-slate-300 bg-slate-100 p-2 flex-shrink-0 dark:border-sql-700 dark:bg-sql-800/40">
                      <label className="mb-1 block text-[11px] text-slate-600 dark:text-slate-300">Database Type</label>
                      <select
                        value={databaseType}
                        onChange={(event) => setDatabaseType(event.target.value as 'postgres' | 'mysql')}
                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 outline-none focus:border-sql-accent dark:border-sql-700 dark:bg-sql-900 dark:text-slate-200"
                      >
                        <option value="postgres">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2 min-h-0">
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
                  </div>
                  <div className="min-h-[120px] max-h-[200px] lg:min-h-[320px] overflow-hidden rounded-md border border-slate-300 bg-white lg:col-span-2 flex-shrink-0 dark:border-sql-700 dark:bg-sql-900">
                    <SchemaVisualizer data={schemaData} />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 dark:text-slate-400 text-xs md:text-sm italic px-4 text-center">
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
