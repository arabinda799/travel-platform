/**
 * Utility to export an array of tabular objects to a CSV file.
 * Includes UTF-8 BOM so Excel opens special characters correctly.
 */
export function exportToCsv(
  filename: string,
  rows: Record<string, any>[],
  columns: { field: string; header: string }[],
): void {
  if (!rows || rows.length === 0) return;

  const headerRow = columns.map(c => `"${(c.header || '').replace(/"/g, '""')}"`).join(',');
  const dataRows = rows.map(row =>
    columns
      .map(c => {
        const val = row[c.field] !== undefined && row[c.field] !== null ? row[c.field] : '';
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(','),
  );

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
