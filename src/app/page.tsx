import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Testimonials } from "@/components/landing/Testimonials";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/ui/logo";
import { MobileNav } from "@/components/landing/MobileNav";
import { generatePageMetadata } from "@/lib/metadata-config";

export const metadata = generatePageMetadata({
  title: "Revenue Protection for Freelance Developers & Designers",
  description: "Stop losing money to missed follow-ups, scope creep, and late payments. Impry OS helps freelancers stay in control with automated reminders, scope tracking, and payment management.",
  path: "/",
  keywords: [
    "freelancer CRM",
    "payment tracking",
    "scope management",
    "client management",
    "freelance tools",
    "revenue protection",
    "follow-up reminders",
    "freelance developers",
    "freelance designers",
    "project management for freelancers",
  ],
});

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="container flex h-16 max-w-[1400px] items-center px-6 lg:px-10 mx-auto">
          <Logo className="mr-6" textClassName="text-xl font-bold text-zinc-900" />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <a href="#features" className="hover:text-zinc-900 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-zinc-900 transition-colors">Pricing</a>
            <a href="#" className="hover:text-zinc-900 transition-colors">About</a>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              <a href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 px-4 py-2">
                Sign In
              </a>
              <a href="/register" className="text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-800 px-5 py-2.5 rounded-lg transition-colors">
                Get Started
              </a>
            </div>
            <MobileNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Hero />
        <Features />
        <Pricing />
        <Testimonials />
        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}
