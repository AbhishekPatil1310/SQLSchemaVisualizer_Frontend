import { useEffect, useState } from 'react';
import api from '../lib/api';

interface SchemaSummaryData {
  summary: string;
  tablesCount: number;
  relationshipsCount: number;
}

interface SchemaSummaryResponse {
  success: boolean;
  data?: SchemaSummaryData;
}

interface SchemaSummaryProps {
  databaseType: string;
}

export function SchemaSummary({ databaseType }: SchemaSummaryProps) {
  const [data, setData] = useState<SchemaSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: response } = await api.get<SchemaSummaryResponse>('/ai/schema-summary', {
          params: { databaseType }
        });

        if (mounted && response.success && response.data) {
          setData(response.data);
        }
      } catch {
        if (mounted) {
          setError('Schema summary is currently unavailable.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      mounted = false;
    };
  }, [databaseType]);

  if (loading) {
    return <div className="rounded-lg border border-slate-300 bg-white p-4 text-xs text-slate-600 dark:border-sql-700 dark:bg-sql-900/60 dark:text-slate-400">Loading schema summary...</div>;
  }

  if (error) {
    return <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-700 dark:text-red-300">{error}</div>;
  }

  if (!data) {
    return null;
  }

  return (
    <section className="rounded-lg border border-slate-300 bg-white p-4 dark:border-sql-700 dark:bg-sql-900/60">
      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">AI Schema Summary</p>
      <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">{data.summary}</p>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        Tables: {data.tablesCount} | Relationships: {data.relationshipsCount}
      </p>
    </section>
  );
}
