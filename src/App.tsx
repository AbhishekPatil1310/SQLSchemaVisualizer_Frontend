import { useEffect, useMemo, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SqlEditor } from './components/SqlEditor';
import { ResultSection } from './components/ResultSection';
import { SchemaVisualizer } from './components/Visualizer';
import { executeSql, fetchSchema } from './lib/query';
import type { QueryResponse } from './lib/query';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Table, Layout, PanelRight, X } from 'lucide-react';
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
  const [isEditorSchemaOpen, setIsEditorSchemaOpen] = useState(false);
  const [editorSchemaWidth, setEditorSchemaWidth] = useState(320);
  const [isResizingEditorSchema, setIsResizingEditorSchema] = useState(false);
  const [editorSchemaLoading, setEditorSchemaLoading] = useState(false);
  const [editorSchemaError, setEditorSchemaError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'data' | 'visual' | 'notes'>('data');
  const [databaseType, setDatabaseType] = useState<'postgres' | 'mysql'>('postgres');
  const [generatedQuery, setGeneratedQuery] = useState<{ query: string; explanation: string } | null>(null);
  const { isAuthenticated } = useAuth();
  const { activeConn } = useWorkspace();
  const editorSectionRef = useRef<HTMLDivElement | null>(null);

  const groupedSchema = useMemo(() => {
    const schemaRows = schemaData?.schema ?? [];
    const grouped: Record<string, Array<{ columnName: string; dataType: string }>> = {};

    schemaRows.forEach((row: any) => {
      const tableName = row.table_name ?? 'unknown_table';
      grouped[tableName] ??= [];
      grouped[tableName].push({
        columnName: row.column_name,
        dataType: row.data_type,
      });
    });

    return grouped;
  }, [schemaData]);

  useEffect(() => {
    if (!isResizingEditorSchema) return;

    const handleMouseMove = (event: MouseEvent) => {
      const container = editorSectionRef.current;
      if (!container) return;

      const bounds = container.getBoundingClientRect();
      const nextWidth = bounds.right - event.clientX;
      const clampedWidth = Math.max(240, Math.min(620, nextWidth));
      setEditorSchemaWidth(clampedWidth);
    };

    const handleMouseUp = () => setIsResizingEditorSchema(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingEditorSchema]);

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
      toast.error(errorMessage);
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
      const serverError = err.response?.data;
      const errorMessage = serverError?.details || serverError?.error || "Failed to fetch database schema.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadSchemaForEditorPanel = async () => {
    if (schemaData?.schema?.length) {
      setEditorSchemaError(null);
      return;
    }

    setEditorSchemaLoading(true);
    setEditorSchemaError(null);

    try {
      const data = await fetchSchema();
      setSchemaData(data);
    } catch (err: any) {
      const serverError = err.response?.data;
      const errorMessage = serverError?.details || serverError?.error || 'Failed to load schema for editor panel.';
      setEditorSchemaError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEditorSchemaLoading(false);
    }
  };

  const handleToggleEditorSchemaPanel = async () => {
    if (isEditorSchemaOpen) {
      setIsEditorSchemaOpen(false);
      setIsResizingEditorSchema(false);
      return;
    }

    setIsEditorSchemaOpen(true);
    await loadSchemaForEditorPanel();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900 transition-colors duration-300 dark:bg-sql-950 dark:text-slate-200">
      <Toaster />
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 w-full md:ml-0">
        {/* Top Section: Editor */}
        <div ref={editorSectionRef} className="h-1/2 min-h-[200px] md:h-1/2 flex min-w-0 relative">
          {!isEditorSchemaOpen ? (
            <button
              onClick={handleToggleEditorSchemaPanel}
              className="absolute bottom-2 right-2 z-20 inline-flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-sql-700 dark:bg-sql-900 dark:text-slate-200 dark:hover:bg-sql-800"
            >
              <PanelRight size={14} />
              Show Schema
            </button>
          ) : null}

          <div className="flex-1 min-w-0">
            <SqlEditor
              code={sql}
              onChange={(val) => setSql(val || "")}
              onExecute={handleRunQuery}
              isLoading={loading}
            />
          </div>

          {isEditorSchemaOpen ? (
            <>
              <div
                onMouseDown={() => setIsResizingEditorSchema(true)}
                className="w-1 cursor-col-resize bg-slate-300 transition hover:bg-sql-accent active:bg-sql-accent dark:bg-sql-700"
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize schema panel"
              />

              <aside
                className="h-full shrink-0 border-l border-slate-300 bg-white dark:border-sql-700 dark:bg-sql-900"
                style={{ width: `${editorSchemaWidth}px` }}
              >
                <div className="flex items-center justify-between border-b border-slate-300 px-3 py-2 dark:border-sql-700">
                  <span className="text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-200">Schema Explorer</span>
                  <button
                    onClick={handleToggleEditorSchemaPanel}
                    className="rounded p-1 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-sql-800 dark:hover:text-white"
                    aria-label="Close schema panel"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="h-[calc(100%-41px)] overflow-auto p-2">
                  {editorSchemaLoading ? (
                    <div className="rounded border border-slate-300 bg-slate-100 p-3 text-xs text-slate-600 dark:border-sql-700 dark:bg-sql-800/40 dark:text-slate-300">
                      Loading schema...
                    </div>
                  ) : editorSchemaError ? (
                    <div className="rounded border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-300">
                      {editorSchemaError}
                    </div>
                  ) : Object.keys(groupedSchema).length ? (
                    <div className="space-y-2">
                      {Object.entries(groupedSchema)
                        .sort(([tableA], [tableB]) => tableA.localeCompare(tableB))
                        .map(([tableName, columns]) => (
                          <details
                            key={tableName}
                            open
                            className="rounded border border-slate-300 bg-slate-50 dark:border-sql-700 dark:bg-sql-800/30"
                          >
                            <summary className="cursor-pointer select-none px-2 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                              {tableName} ({columns.length})
                            </summary>
                            <div className="border-t border-slate-300 px-2 py-1 dark:border-sql-700">
                              {columns.map((column, index) => (
                                <div
                                  key={`${tableName}-${column.columnName}-${index}`}
                                  className="flex items-center justify-between py-1 text-[11px]"
                                >
                                  <span className="text-slate-700 dark:text-slate-200">{column.columnName}</span>
                                  <span className="text-slate-500 dark:text-slate-400">{column.dataType}</span>
                                </div>
                              ))}
                            </div>
                          </details>
                        ))}
                    </div>
                  ) : (
                    <div className="rounded border border-slate-300 bg-slate-100 p-3 text-xs text-slate-600 dark:border-sql-700 dark:bg-sql-800/40 dark:text-slate-300">
                      Click "Show Schema" to load tables and columns.
                    </div>
                  )}
                </div>
              </aside>
            </>
          ) : null}
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
