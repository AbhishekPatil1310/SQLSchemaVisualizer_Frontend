import Editor from '@monaco-editor/react';
import { useCallback } from 'react';

interface SqlEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  onExecute: () => void;
  isLoading: boolean;
}

export const SqlEditor = ({ code, onChange, onExecute, isLoading }: SqlEditorProps) => {
  const handleKeyDown = useCallback((ev: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Enter to execute query
    if (ev.ctrlKey && ev.key === 'Enter' && !isLoading) {
      ev.preventDefault();
      onExecute();
    }
  }, [onExecute, isLoading]);

  return (
    <div 
      className="h-full flex flex-col bg-brand-900"
      tabIndex={0} // Enables keyboard focus on container
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-between items-center px-4 py-2 bg-brand-900 border-b border-slate-800">
        <span className="text-xs font-bold text-slate-400">
          SQL EDITOR 
          <span className="ml-2 text-slate-600 text-xs">(Ctrl+Enter to run)</span>
        </span>
        <button 
          onClick={onExecute}
          disabled={isLoading}
          className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-bold rounded transition-all duration-200"
        >
          {isLoading ? 'RUNNING...' : 'RUN QUERY'}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            readOnly: isLoading,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
};
