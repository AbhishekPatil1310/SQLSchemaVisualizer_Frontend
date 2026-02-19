import { useEffect, useState } from 'react';
import api from '../lib/api';

interface CacheStats {
  cachedItems: number;
  hits: number;
  misses: number;
  requests: number;
  hitRate: number;
  avgGenerationMs: number;
}

interface SchemaCacheStats {
  cachedSchemas: number;
  hits: number;
  misses: number;
}

interface StatsResponse {
  success: boolean;
  data?: {
    aiService: CacheStats;
    schemaAnalyzer: SchemaCacheStats;
  };
}

export function AIStatistics() {
  const [stats, setStats] = useState<StatsResponse['data'] | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const { data } = await api.get<StatsResponse>('/ai/stats');
        if (mounted && data.success && data.data) {
          setStats(data.data);
        }
      } catch {
        if (mounted) {
          setStats(null);
        }
      }
    };

    void load();
    const interval = window.setInterval(() => {
      void load();
    }, 30000);

    return () => {
      mounted = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!stats) {
    return (
      <section className="rounded-lg border border-sql-700 bg-sql-900/60 p-4 text-xs text-slate-400">
        AI stats unavailable.
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-sql-700 bg-sql-900/60 p-4 text-xs text-slate-300">
      <p className="font-semibold text-slate-100">AI Statistics</p>
      <p className="mt-2">Cache items: {stats.aiService.cachedItems}</p>
      <p>Hit rate: {(stats.aiService.hitRate * 100).toFixed(1)}%</p>
      <p>Total requests: {stats.aiService.requests}</p>
      <p>Avg generation time: {stats.aiService.avgGenerationMs}ms</p>
      <p className="mt-2">Schema cache: {stats.schemaAnalyzer.cachedSchemas}</p>
    </section>
  );
}

