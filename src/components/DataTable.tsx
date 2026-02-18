interface DataTableProps {
  columns: string[];
  rows: any[];
}

const DataTable = ({ columns, rows }: DataTableProps) => {
  return (
    <div className="relative overflow-x-auto h-full w-full">
      <table className="w-full text-left border-collapse min-w-max">
        <thead className="sticky top-0 bg-sql-800 z-10 shadow-md">
          <tr>
            {columns.map((col) => (
              <th 
                key={col} 
                className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm font-bold text-sql-accent border-b border-sql-700 uppercase tracking-wider whitespace-nowrap"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-sql-700/50">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-sql-accent2/5 transition-colors duration-150">
              {columns.map((col) => (
                <td key={col} className="px-2 md:px-4 py-1.5 md:py-2.5 text-[11px] md:text-sm text-slate-300 font-mono break-words max-w-xs">
                  {row[col]?.toString() ?? <span className="text-slate-600 italic">NULL</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;