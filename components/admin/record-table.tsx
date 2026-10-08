export function RecordTable({
  columns,
  rows,
  empty,
}: {
  columns: string[];
  rows: React.ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="rounded-xl bg-white px-4 py-10 text-center text-[14px] text-[#626262] ring-1 ring-[#14181b]/10">{empty}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl bg-white ring-1 ring-[#14181b]/10">
      <table className="w-full min-w-[640px] border-collapse text-left text-[14px]">
        <thead>
          <tr className="border-b border-[#f2f3f8] text-[12px] tracking-[0.04em] text-[#626262] uppercase">
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 font-medium">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-[#f2f3f8] last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="max-w-[320px] px-4 py-3 align-top text-[#242428]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
