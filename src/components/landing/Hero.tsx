import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, DollarSign, Clock, Shield } from "lucide-react";
import Image from "next/image";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-white min-h-[90vh] flex flex-col justify-center">
            {/* Subtle Glowing Background Effects (Light Mode Version of the Inspo) */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-zinc-200/50 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-zinc-100/80 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/2 w-96 h-96 bg-zinc-200/40 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>

            <div className="container px-6 lg:px-10 py-20 mx-auto max-w-[1400px] relative z-10 flex flex-col items-center text-center">
                
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-200 bg-white/50 backdrop-blur-sm text-sm font-medium text-zinc-600 mb-8 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-zinc-900 animate-pulse"></span>
                    Protect your freelance revenue
                </div>

                {/* Main Headline */}
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 max-w-4xl mx-auto leading-[1.1] mb-6">
                    Stop losing money to <span className="text-zinc-500">scope creep</span> and missed follow-ups.
                </h1>
                
                {/* Subheadline */}
                <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The revenue protection OS for freelance developers and designers. Define scopes, automate your invoice reminders, and get paid on time, every time.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/register">
                        <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-xl shadow-zinc-900/10">
                            Get Started Free
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                    <Link href="#features">
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold rounded-full border-zinc-200 bg-white/50 backdrop-blur-sm hover:bg-zinc-50 text-zinc-900">
                            Discover More
                        </Button>
                    </Link>
                </div>

                {/* Floating Nodes (Inspired by the Dribbble shot) */}
                <div className="hidden lg:block absolute inset-0 pointer-events-none">
                    {/* Node 1: Scope */}
                    <div className="absolute top-[20%] left-[15%] flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-lg flex items-center justify-center mb-2">
                            <Shield className="w-4 h-4 text-zinc-900" />
                        </div>
                        <div className="text-xs font-semibold text-zinc-900">Scope Guard</div>
                        <div className="text-[10px] text-zinc-500">Active</div>
                        <div className="h-16 w-px bg-gradient-to-b from-zinc-200 to-transparent mt-2"></div>
                    </div>

                    {/* Node 2: Payment */}
                    <div className="absolute top-[30%] right-[15%] flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-lg flex items-center justify-center mb-2">
                            <DollarSign className="w-4 h-4 text-zinc-900" />
                        </div>
                        <div className="text-xs font-semibold text-zinc-900">Invoice Paid</div>
                        <div className="text-[10px] text-zinc-500">+$2,400</div>
                        <div className="h-20 w-px bg-gradient-to-b from-zinc-200 to-transparent mt-2"></div>
                    </div>

                    {/* Node 3: Follow Up */}
                    <div className="absolute bottom-[20%] left-[25%] flex flex-col items-center">
                        <div className="h-16 w-px bg-gradient-to-t from-zinc-200 to-transparent mb-2"></div>
                        <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-lg flex items-center justify-center mt-2">
                            <Clock className="w-4 h-4 text-zinc-900" />
                        </div>
                        <div className="text-xs font-semibold text-zinc-900 mt-2">Follow-up Sent</div>
                        <div className="text-[10px] text-zinc-500">Just now</div>
                    </div>
                </div>
            </div>

            {/* Social Proof Section (Bottom of Hero) */}
            <div className="w-full border-t border-zinc-100 bg-white/50 backdrop-blur-md py-8 relative z-20 mt-auto">
                <div className="container mx-auto px-6 max-w-[1400px]">
                    <p className="text-center text-sm font-medium text-zinc-500 mb-6">TRUSTED BY INDEPENDENT PROFESSIONALS WORLDWIDE</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
                        {/* Simulated Logos with text for now */}
                        <span className="text-lg font-bold font-serif tracking-tighter">Vercel</span>
                        <span className="text-lg font-bold tracking-tight flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-zinc-900"></div>loom</span>
                        <span className="text-lg font-bold italic">Cash App</span>
                        <span className="text-lg font-bold flex items-center gap-1"><div className="w-4 h-4 border-2 border-zinc-900 rounded-full"></div> Loops</span>
                        <span className="text-lg font-black tracking-tighter">_zapier</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
