
import { NextResponse } from 'next/server';
import { getDashboardReminders } from '@/lib/dashboard';
import { createClient } from '@/lib/auth';

export async function GET() {
    try {
        const supabase = await createClient();
        // Check authentication first
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({
                error: 'Auth Error',
                details: authError,
                user: user
            }, { status: 401 });
        }

        // Check if table exists by simple query
        const { error: tableCheckError } = await supabase.from('reminders').select('count', { count: 'exact', head: true });

        if (tableCheckError) {
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
