import fs from 'fs';
import path from 'path';

export function logError(message: string, error: any) {
    try {
        const logPath = path.join(process.cwd(), 'debug.log');
        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? error.stack || error.message : String(error);
        const logEntry = `[${timestamp}] ERROR: ${message}\n${errorMessage}\n---\n`;
        fs.appendFileSync(logPath, logEntry);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}

export function logInfo(message: string) {
    try {
        const logPath = path.join(process.cwd(), 'debug.log');
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] INFO: ${message}\n`;
        fs.appendFileSync(logPath, logEntry);
    } catch (e) {
        console.error('Failed to write to log file:', e);
    }
}
