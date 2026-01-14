export function convertToCSV(data: any[], headers?: string[]): string {
    if (!data || data.length === 0) {
        return '';
    }

    const keys = headers || Object.keys(data[0]);
    const headerRow = keys.join(',');

    const rows = data.map(row => {
        return keys.map(key => {
            let val = row[key];

            // Handle null/undefined
            if (val === null || val === undefined) {
                val = '';
            }

            // Handle strings with commas or quotes
            if (typeof val === 'string') {
                val = `"${val.replace(/"/g, '""')}"`;
            }

            // Handle dates
            if (val instanceof Date) {
                val = val.toISOString();
            }

            return val;
        }).join(',');
    });

    return [headerRow, ...rows].join('\n');
}

export function downloadCSV(csvContent: string, fileName: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
