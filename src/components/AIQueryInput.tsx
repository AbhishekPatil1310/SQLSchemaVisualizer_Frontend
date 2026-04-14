import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import api from '../lib/api';

interface GenerateResponse {
  success: boolean;
  data?: {
    query: string;
    explanation: string;
  };
  error?: string;
  details?: string;
}

interface AIQueryInputProps {
  onQueryGenerated: (query: string, explanation: string) => void;
  databaseType: string;
}

export function AIQueryInput({ onQueryGenerated, databaseType }: AIQueryInputProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!input.trim()) {
      setError('Please describe the query you want to generate.');
      return;
    }

    if (!databaseType || databaseType === 'unknown') {
      setError('Please select a database type first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post<GenerateResponse>('/ai/generate-query', {
        query: input.trim(),
        databaseType
      });

      if (!data.success || !data.data?.query) {
        throw new Error(data.details || data.error || 'AI failed to generate a query');
      }

      onQueryGenerated(data.data.query, data.data.explanation || 'No explanation returned');
      setInput('');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to generate query right now';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-3 md:p-4 dark:border-sql-700 dark:bg-sql-900/60">
      <div className="mb-3 flex items-center gap-2 text-sql-accent">
        <Sparkles size={16} />
        <h3 className="text-sm font-semibold">AI SQL Assistant</h3>
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        rows={3}
        placeholder="Example: Show the top 10 users who placed the most orders in the last 30 days"
        className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-sql-accent resize-none dark:border-sql-700 dark:bg-sql-950 dark:text-slate-100"
      />

      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Tip: include filters, date range, and desired columns for better results.</p>

      {error ? <p className="mt-2 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">{error}</p> : null}
      {!input.trim() ? (
        <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-300">Type your request above to generate SQL.</p>
      ) : null}

      <button
        type="button"
        onClick={handleGenerate}
        disabled={loading}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-cyan-300 bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:border-cyan-200 disabled:bg-cyan-200 disabled:text-slate-700"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
        Generate Query
      </button>
    </section>
  );
}
