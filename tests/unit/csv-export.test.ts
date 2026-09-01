import { describe, it, expect } from 'vitest';
import { convertToCSV } from '@/lib/csv-export';

describe('CSV Export Utilities (csv-export.ts)', () => {
  it('returns empty string when given empty array or falsy input', () => {
    expect(convertToCSV([])).toBe('');
    expect(convertToCSV(null as any)).toBe('');
  });

  it('converts basic object array to CSV format', () => {
    const data = [
      { name: 'Acme Corp', amount: 1500, status: 'paid' },
      { name: 'Beta LLC', amount: 3000, status: 'pending' },
    ];

    const result = convertToCSV(data);
    const lines = result.split('\n');

    expect(lines[0]).toBe('name,amount,status');
    expect(lines[1]).toBe('"Acme Corp",1500,"paid"');
    expect(lines[2]).toBe('"Beta LLC",3000,"pending"');
  });

  it('properly escapes quotes inside strings', () => {
    const data = [{ notes: 'Client said "urgent" deliverable' }];
    const result = convertToCSV(data);

    expect(result).toContain('"Client said ""urgent"" deliverable"');
  });

  it('handles null and undefined field values gracefully', () => {
    const data = [
      { id: '1', email: null, phone: undefined },
    ];
    const result = convertToCSV(data);
    expect(result).toBe('id,email,phone\n"1","",""');
  });

  it('formats Date instances to ISO strings in CSV', () => {
    const testDate = new Date('2026-08-31T12:00:00.000Z');
    const data = [{ event: 'Created', timestamp: testDate }];
    const result = convertToCSV(data);

    expect(result).toContain('2026-08-31T12:00:00.000Z');
  });
});
