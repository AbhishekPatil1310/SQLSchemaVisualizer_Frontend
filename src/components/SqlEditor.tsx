import Editor from '@monaco-editor/react';
import { useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

interface SqlEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  onExecute: () => void;
  isLoading: boolean;
}

export const SqlEditor = ({ code, onChange, onExecute, isLoading }: SqlEditorProps) => {
  const { theme } = useTheme();

  const handleKeyDown = useCallback((ev: React.KeyboardEvent<HTMLDivElement>) => {
    // Ctrl+Enter to execute query
    if (ev.ctrlKey && ev.key === 'Enter' && !isLoading) {
      ev.preventDefault();
      onExecute();
    }
  }, [onExecute, isLoading]);

  return (
    <div 
      className="h-full flex flex-col bg-white dark:bg-sql-900 transition-colors duration-300"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="flex justify-between items-center gap-2 px-2 py-2 bg-slate-100 border-b border-slate-300 flex-wrap dark:bg-sql-900 dark:border-slate-800">
        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 whitespace-nowrap">
          SQL EDITOR 
          <span className="ml-1 text-slate-500 dark:text-slate-600 text-[10px] hidden sm:inline">(Ctrl+Enter to run)</span>
        </span>
        <button 
          onClick={onExecute}
          disabled={isLoading}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-[10px] font-bold rounded transition-all duration-200 flex-shrink-0"
        >
          {isLoading ? 'RUNNING...' : 'RUN'}
        </button>
      </div>
      <div className="flex-1 overflow-hidden min-h-0">
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme={theme === 'light' ? 'vs' : 'vs-dark'}
          value={code}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            readOnly: isLoading,
            automaticLayout: true,
            scrollBeyondLastLine: false,
            padding: { top: 8 },
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            wrappingIndent: 'indent',
          }}
        />
      </div>
    </div>
  );
};
