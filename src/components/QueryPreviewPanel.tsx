import { useState } from 'react';
import { CheckCircle2, Clipboard, Loader2, XCircle } from 'lucide-react';
import api from '../lib/api';

interface QueryPreviewPanelProps {
  query: string;
  explanation: string;
  databaseType: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestedIndexes?: string[];
  indexes?: string[];
}

interface ValidateResponse {
  success: boolean;
  data?: ValidationResult;
  error?: string;
  details?: string;
}

export function QueryPreviewPanel({ query, explanation, databaseType }: QueryPreviewPanelProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(query);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleValidate = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setValidation(null);

    try {
      const { data } = await api.post<ValidateResponse>('/ai/validate-query', { query, databaseType });
      if (!data.success || !data.data) {
        throw new Error(data.details || data.error || 'Validation failed');
      }
      setValidation(data.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to validate query';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const indexes = validation?.suggestedIndexes ?? validation?.indexes ?? [];

  return (
    <section className="rounded-lg border border-sql-700 bg-sql-900/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">Generated SQL</h3>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1 rounded-md border border-sql-700 px-2 py-1 text-xs text-slate-300 hover:bg-sql-800"
        >
          <Clipboard size={12} />
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <pre className="overflow-x-auto rounded-md bg-sql-950 p-3 text-xs text-slate-200">
        <code className="font-mono">{query}</code>
      </pre>

      <div className="mt-3 rounded-md border border-emerald-500/20 bg-emerald-500/10 p-3">
        <p className="text-xs font-medium text-emerald-200">AI Explanation</p>
        <p className="mt-1 text-xs text-emerald-100">{explanation}</p>
      </div>

      <button
        type="button"
        onClick={handleValidate}
        disabled={loading}
        className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
        Validate & Optimize
      </button>

      {error ? <p className="mt-2 rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p> : null}

      {validation ? (
        <div className="mt-3 space-y-2 text-xs">
          <div
            className={`flex items-center gap-2 rounded-md px-3 py-2 ${
              validation.isValid ? 'bg-emerald-500/10 text-emerald-200' : 'bg-red-500/10 text-red-200'
            }`}
          >
            {validation.isValid ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {validation.isValid ? 'Query is valid' : 'Validation errors found'}
          </div>

          {validation.errors.length > 0 ? (
            <div className="rounded-md bg-red-500/10 px-3 py-2 text-red-200">
              {validation.errors.map((item) => (
                <p key={item}>- {item}</p>
              ))}
            </div>
          ) : null}

          {validation.warnings.length > 0 ? (
            <div className="rounded-md bg-amber-500/10 px-3 py-2 text-amber-200">
              {validation.warnings.map((item) => (
                <p key={item}>⚠️ {item}</p>
              ))}
            </div>
          ) : null}

          {indexes.length > 0 ? (
            <div className="rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-violet-200">
              <p className="mb-1 font-semibold">Suggested Indexes</p>
              {indexes.map((indexSql) => (
                <p key={indexSql}>{indexSql}</p>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

