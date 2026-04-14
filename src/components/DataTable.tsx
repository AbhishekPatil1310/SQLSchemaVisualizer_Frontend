interface DataTableProps {
  columns: string[];
  rows: any[];
}

const DataTable = ({ columns, rows }: DataTableProps) => {
  return (
    <div className="relative h-full w-full overflow-auto scrollbar-thin bg-white dark:bg-sql-950">
      <table className="w-full min-w-max table-auto border-separate border-spacing-0 text-left">
        <thead className="sticky top-0 z-10 bg-slate-200 shadow-sm dark:bg-sql-800">
          <tr>
            {columns.map((col) => (
              <th 
                key={col} 
                className="border-r border-b border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 uppercase tracking-wider whitespace-nowrap min-w-[120px] last:border-r-0 dark:border-sql-700 dark:text-sql-accent"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={Math.max(columns.length, 1)}
                className="px-4 py-6 text-center text-sm text-slate-600 dark:text-slate-400"
              >
                Query ran successfully but returned no rows.
              </td>
            </tr>
          ) : null}
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className={`transition-colors duration-150 ${
                idx % 2 === 0 ? 'bg-white dark:bg-sql-950' : 'bg-slate-50 dark:bg-sql-900/40'
              } hover:bg-cyan-50 dark:hover:bg-sql-accent2/5`}
            >
              {columns.map((col) => (
                <td
                  key={col}
                  className="border-r border-b border-slate-200 px-3 py-2 text-xs text-slate-800 font-mono break-words max-w-xs align-top last:border-r-0 dark:border-sql-700/70 dark:text-slate-200"
                >
                  {row[col]?.toString() ?? <span className="text-slate-500 dark:text-slate-600 italic">NULL</span>}
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
