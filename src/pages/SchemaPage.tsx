import { useEffect, useState } from "react";
import { SchemaVisualizer } from "../components/Visualizer";
import { fetchSchema } from "../lib/query";
import { AIQueryInput } from "../components/AIQueryInput";
import { QueryPreviewPanel } from "../components/QueryPreviewPanel";
import { SchemaSummary } from "../components/SchemaSummary";
import { AIStatistics } from "../components/AIStatistics";

export const SchemaPage = () => {
  const [schemaData, setSchemaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [databaseType, setDatabaseType] = useState<'postgres' | 'mysql'>('postgres');
  const [generatedQuery, setGeneratedQuery] = useState<{ query: string; explanation: string } | null>(null);

  useEffect(() => {
    fetchSchema()
      .then(setSchemaData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-400">
        Mapping database relationships...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col gap-4 bg-sql-950 p-4 text-slate-100">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="databaseType" className="text-xs text-slate-300">Database Type</label>
        <select
          id="databaseType"
          value={databaseType}
          onChange={(event) => setDatabaseType(event.target.value as 'postgres' | 'mysql')}
          className="rounded-md border border-sql-700 bg-sql-900 px-2 py-1 text-xs"
        >
          <option value="postgres">PostgreSQL</option>
          <option value="mysql">MySQL</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
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
        <div className="min-h-[500px] overflow-hidden rounded-lg border border-sql-700 lg:col-span-2">
          <SchemaVisualizer data={schemaData} />
        </div>
      </div>
    </div>
  );
};
