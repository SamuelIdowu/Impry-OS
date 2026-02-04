import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Bell, DollarSign } from "lucide-react";
import Image from "next/image";
import { NotchedImage } from "@/components/ui/notched-image";

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-background">
            <div className="container px-6 lg:px-10 py-16 md:py-20 lg:py-24 mx-auto max-w-[1400px]">
                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center gap-8 mb-12 md:mb-16">
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900">Follow Up</h3>
                            <p className="text-xs text-zinc-600 max-w-[140px]">Never miss a client interaction again</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900">Scope Guard</h3>
                            <p className="text-xs text-zinc-600 max-w-[140px]">Prevent scope creep with snapshots</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900">Get Paid</h3>
                            <p className="text-xs text-zinc-600 max-w-[140px]">Track payments and milestones</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left Column - Text Content */}
                    <div className="space-y-8">
                        <div className="space-y-6">
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                                <span className="italic font-normal">Authentic, honest</span>{" "}
                                revenue protection{" "}
                                <span className="italic font-normal">works.</span>
                            </h1>
                            <p className="text-lg md:text-xl text-zinc-600 max-w-[500px]">
                                Help freelance developers and designers avoid losing money, time, and clients with a lightweight system that enforces follow-ups, protects scope, and tracks payments.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register">
                                <Button size="lg" className="h-12 px-8 text-base font-semibold rounded-lg">
                                    Get Started Free
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="#pricing">
                                <Button size="lg" variant="outline" className="h-12 px-8 text-base font-semibold rounded-lg">
                                    View Pricing
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Right Column - Hero Image */}
                    <div className="relative">
                        <NotchedImage
                            src="/hero-freelancer.png"
                            alt="Freelancer working on laptop in modern workspace"
                            width={300}
                            height={300}
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
