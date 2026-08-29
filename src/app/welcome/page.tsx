import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { getSession } from '@/lib/auth';

export default async function WelcomePage() {
  const session = await getSession();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 shadow-xl">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-9 w-9" />
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          Payment Successful!
        </h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 leading-relaxed">
          Welcome to Impry OS. Your subscription has been activated and your workspace is ready to protect and grow your freelance revenue.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-left space-y-2.5 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Automatic revenue protection active</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
            <span>Full scope tracking & client management unlocked</span>
          </div>
        </div>

        <div className="space-y-3">
          <Link href={session ? "/workspaces" : "/login"} className="block">
            <Button className="w-full h-12 rounded-xl text-sm font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 gap-2">
              <span>Go to Workspace Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="ghost" className="w-full text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
