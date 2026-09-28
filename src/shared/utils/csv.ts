/** Escapes a single CSV field, quoting it when it contains a comma, quote or newline. */
export function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/**
 * Parses CSV text into rows of string cells, honoring quoted fields
 * (commas/newlines/escaped "" inside quotes). Handles \r\n and \n line endings.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = '';
  };
  const pushRow = () => {
    pushCell();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      pushCell();
    } else if (char === '\r') {
      // skip, \n (or end of text) handles the row break
    } else if (char === '\n') {
      pushRow();
    } else {
      cell += char;
    }
  }

  // Trailing cell/row (file may or may not end with a newline).
  if (cell.length > 0 || row.length > 0) {
    pushRow();
  }

  return rows.filter(r => !(r.length === 1 && r[0] === ''));
}
