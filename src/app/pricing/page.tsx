import { headers } from 'next/headers';
import { getSession } from '@/lib/auth';
import { PaddlePricingTable } from '@/components/pricing/PaddlePricingTable';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
import { Footer } from '@/components/landing/Footer';
import { generatePageMetadata } from '@/lib/metadata-config';
import { JsonLd, generateSoftwareApplicationSchema } from '@/components/shared/json-ld';

export const metadata = generatePageMetadata({
  title: 'Pricing & Plans — Revenue Protection for Freelancers',
  description: 'Choose a plan tailored for your freelance business or studio. Country-localized pricing, flexible billing, and instant Paddle checkout.',
  path: '/pricing',
});

export default async function PricingPage() {
  const headersList = await headers();
  // Read country from standard edge / CDN headers
  const detectedCountry =
    headersList.get('x-vercel-ip-country') ||
    headersList.get('cf-ipcountry') ||
    headersList.get('x-country-code') ||
    'OTHERS';

  const session = await getSession();
  const userEmail = session?.user?.email;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50/50 dark:bg-zinc-950">
      <JsonLd data={generateSoftwareApplicationSchema()} />
      {/* Navigation Bar */}
      <header className="sticky top-6 z-50 mx-auto w-[95%] max-w-5xl rounded-full border border-white/40 bg-white/40 dark:bg-zinc-900/60 dark:border-zinc-800 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-10">
            <Link href="/">
              <Logo className="mr-2" textClassName="text-xl font-bold text-zinc-900 dark:text-white" />
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
              <Link href="/#features" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-zinc-900 dark:text-white font-semibold transition-colors">
                Pricing
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href="/workspaces"
                className="text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 px-5 py-2.5 rounded-full transition-all hover:scale-105 shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white px-4 py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 px-5 py-2.5 rounded-full transition-all hover:scale-105 shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Pricing Content */}
      <main className="flex-1 pt-8 pb-16">
        <PaddlePricingTable country={detectedCountry} userEmail={userEmail} />
      </main>

      <Footer />
    </div>
  );
}
