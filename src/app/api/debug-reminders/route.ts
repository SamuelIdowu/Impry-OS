
import { NextResponse } from 'next/server';
import { getDashboardReminders } from '@/lib/dashboard';
import { getUser } from '@/lib/auth';
import { db } from '@/server/db';
import { sql } from 'drizzle-orm';


export async function GET() {
    try {
        // Check authentication first
        const user = await getUser();

        if (!user) {
            return NextResponse.json({
                error: 'Auth Error',
                user: user
            }, { status: 401 });
        }

        // Check if table exists by simple query
        try {
            await db.execute(sql`select count(*) from reminders`);
        } catch (tableCheckError: any) {
            return NextResponse.json({
                error: 'Table Check Error',
                details: tableCheckError,
                message: tableCheckError.message,
                hint: tableCheckError.hint,
                code: tableCheckError.code
            }, { status: 500 });
        }

        // Try the actual function
        try {
            const reminders = await getDashboardReminders();
            return NextResponse.json({ success: true, count: reminders.length, reminders });
        } catch (e: any) {
            return NextResponse.json({
                error: 'Function Execution Error',
                message: e.message,
                stack: e.stack,
                raw: e
            }, { status: 500 });
        }

    } catch (error: any) {
        return NextResponse.json({
            error: 'Unexpected Error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
