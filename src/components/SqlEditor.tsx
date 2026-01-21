  import Editor from '@monaco-editor/react';

  interface SqlEditorProps {
    code: string;
    onChange: (value: string | undefined) => void;
    onExecute: () => void;
    isLoading: boolean;
  }

  export const SqlEditor = ({ code, onChange, onExecute, isLoading }: SqlEditorProps) => {
    return (
      <div className="h-full flex flex-col bg-brand-900">
        <div className="flex justify-between items-center px-4 py-2 bg-brand-900 border-b border-slate-800">
          <span className="text-xs font-bold text-slate-400">SQL EDITOR</span>
          <button 
            onClick={onExecute}
            disabled={isLoading}
            className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-xs font-bold rounded transition"
          >
            {isLoading ? 'RUNNING...' : 'RUN QUERY'}
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="sql"
            theme="vs-dark"
            value={code} // This ensures the editor shows the current state
            onChange={onChange} // This updates the state when you type
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              readOnly: isLoading, // Prevents typing ONLY while a query is running
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    );
  };