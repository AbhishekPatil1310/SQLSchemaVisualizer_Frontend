import { useState } from 'react';
import { Table as TableIcon, Code } from 'lucide-react';
import type{ QueryResponse } from '../lib/query';
import DataTable from './DataTable';

interface ResultSectionProps {
  results: QueryResponse | null;
}

export const ResultSection = ({ results }: ResultSectionProps) => {
  const [viewMode, setViewMode] = useState<'table' | 'json'>('table');

  if (!results) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500 italic text-sm">
        Run a query to see results
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-sql-950">
      {/* Tab Header */}
      <div className="flex items-center justify-between px-3 md:px-4 py-2.5 border-b border-sql-700 bg-sql-800/50 flex-wrap gap-2">
        <div className="flex gap-2 md:gap-4">
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 md:gap-2 text-xs font-semibold transition whitespace-nowrap ${
              viewMode === 'table' 
                ? 'text-sql-accent border-b-2 border-sql-accent pb-2' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon size={14} /> <span className="hidden sm:inline">TABLE</span>
          </button>
          <button 
            onClick={() => setViewMode('json')}
            className={`flex items-center gap-1.5 md:gap-2 text-xs font-semibold transition whitespace-nowrap ${
              viewMode === 'json' 
                ? 'text-sql-accent border-b-2 border-sql-accent pb-2' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code size={14} /> <span className="hidden sm:inline">JSON</span>
          </button>
        </div>
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider bg-sql-700/50 px-2 py-1 rounded">
          {results.rowCount} rows
        </span>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'table' ? (
          <DataTable columns={results.columns || []} rows={results.rows || []} />
        ) : (
          <pre className="p-3 md:p-4 text-xs font-mono text-sql-success/90 bg-sql-900/50 h-full overflow-auto">
            {JSON.stringify(results.rows, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};