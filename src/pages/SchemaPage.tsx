import { useEffect, useState } from "react";
import { SchemaVisualizer } from "../components/Visualizer";
import { fetchSchema } from "../lib/query";

export const SchemaPage = () => {
  const [schemaData, setSchemaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  return <SchemaVisualizer data={schemaData} />;
};
