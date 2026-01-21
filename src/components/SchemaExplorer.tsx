import { useState } from 'react';
import { Database, ChevronDown, ChevronRight, Table } from 'lucide-react';

export const SchemaExplorer = () => {
  const [schema] = useState<any>(null);
  const [expandedTables, setExpandedTables] = useState<string[]>([]);

  const toggleTable = (tableName: string) => {
    setExpandedTables(prev => 
      prev.includes(tableName) ? prev.filter(t => t !== tableName) : [...prev, tableName]
    );
  };

  // Grouping logic: Tables -> Columns
  const tables = schema?.schema.reduce((acc: any, curr: any) => {
    if (!acc[curr.table_name]) acc[curr.table_name] = [];
    acc[curr.table_name].push(curr);
    return acc;
  }, {});

  return (
    <div className="p-4 overflow-y-auto h-full border-r border-slate-800 bg-brand-900/50">
      <h3 className="text-xs font-bold text-slate-400 mb-4 flex items-center gap-2">
        <Database size={14} /> SCHEMA EXPLORER
      </h3>
      
      {tables && Object.keys(tables).map(tableName => (
        <div key={tableName} className="mb-2">
          <button 
            onClick={() => toggleTable(tableName)}
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition w-full text-left"
          >
            {expandedTables.includes(tableName) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Table size={14} className="text-blue-400" />
            <span className="font-medium">{tableName}</span>
          </button>

          {expandedTables.includes(tableName) && (
            <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-slate-700 pl-3">
              {tables[tableName].map((col: any) => (
                <div key={col.column_name} className="flex items-center justify-between text-[11px] group">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">{col.column_name}</span>
                  </div>
                  <span className="text-slate-600 font-mono italic">{col.data_type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};