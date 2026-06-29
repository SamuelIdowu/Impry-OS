import { Bell, Shield, DollarSign, Clock, Zap, Check } from "lucide-react";
import Image from "next/image";

export function Features() {
    return (
        <section id="features" className="bg-zinc-50 py-24">
            <div className="container px-6 lg:px-10 mx-auto max-w-[1200px]">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                        Everything you need. Nothing you don't.
                    </h2>
                    <p className="mx-auto max-w-[600px] text-lg text-zinc-600">
                        A lightweight suite built specifically for independent creators to protect revenue and maintain client boundaries.
                    </p>
                </div>

                {/* Bento Box Layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    
                    {/* Bento 1: Large Wide Box (Payment/Dashboard) */}
                    <div className="md:col-span-2 relative overflow-hidden rounded-3xl bg-white border border-zinc-200 p-8 shadow-sm group hover:shadow-md transition-shadow">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-100 rounded-full mix-blend-multiply filter blur-[80px] opacity-30"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <DollarSign className="w-5 h-5 text-zinc-900" />
                                    <h3 className="text-xl font-bold text-zinc-900">Payment Tracking</h3>
                                </div>
                                <p className="text-zinc-600 max-w-sm">
                                    Track milestones and get reminders for overdue invoices.
                                </p>
                            </div>
                            {/* Mock UI inside the box */}
                            <div className="bg-zinc-50 rounded-xl border border-zinc-100 p-4 w-3/4 shadow-sm self-end">
                                <div className="text-sm font-medium text-zinc-500 mb-1">Total Collected</div>
                                <div className="text-3xl font-bold text-zinc-900 mb-4">$14,250</div>
                                <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-zinc-900 w-[75%]"></div>
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-zinc-500">
                                    <span>75% of $19,000 Scope</span>
                                    <span className="text-green-600 font-medium">On Track</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bento 2: Tall Box (Follow-ups) */}
                    <div className="md:col-span-1 md:row-span-2 relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 p-8 shadow-sm group hover:shadow-lg transition-shadow">
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-zinc-700 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
                        <div className="relative z-10 flex flex-col h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Bell className="w-5 h-5 text-white" />
                                    <h3 className="text-xl font-bold text-white">Follow-Up Guard</h3>
                                </div>
                                <p className="text-zinc-400">
                                    Never let a lead go cold or an invoice go unpaid.
                                </p>
                            </div>
                            <div className="mt-auto space-y-3">
                                {/* Mock UI list items */}
                                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/10">
                                    <div className="text-xs text-zinc-300 font-medium mb-1">Today</div>
                                    <div className="text-sm text-white flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div> Follow up on Stripe invoice
                                    </div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/10 opacity-70">
                                    <div className="text-xs text-zinc-400 font-medium mb-1">Tomorrow</div>
                                    <div className="text-sm text-zinc-300 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-zinc-500"></div> Send proposal to Acme Corp
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bento 3: Square Box (Scope Snapshot) */}
                    <div className="md:col-span-1 relative overflow-hidden rounded-3xl bg-white border border-zinc-200 p-8 shadow-sm group hover:shadow-md transition-shadow">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-100 rounded-full mix-blend-multiply filter blur-[60px] opacity-40"></div>
                        <div className="relative z-10 flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-5 h-5 text-zinc-900" />
                                    <h3 className="text-xl font-bold text-zinc-900">Scope Snapshot</h3>
                                </div>
                                <p className="text-zinc-600 text-sm">
                                    Timestamped agreements to prevent scope creep.
                                </p>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center gap-2 text-sm text-zinc-700">
                                    <Check className="w-4 h-4 text-green-500" /> Homepage Design
                                </div>
                                <div className="flex items-center gap-2 text-sm text-zinc-700">
                                    <Check className="w-4 h-4 text-green-500" /> Auth Flow
                                </div>
                                <div className="flex items-center gap-2 text-sm text-zinc-400 line-through">
                                    Mobile App (Out of scope)
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bento 4: Square Box (Speed/Timeline) */}
                    <div className="md:col-span-1 relative overflow-hidden rounded-3xl bg-white border border-zinc-200 p-8 shadow-sm group hover:shadow-md transition-shadow">
                        <div className="relative z-10 flex flex-col h-full justify-center items-center text-center">
                            <Zap className="w-8 h-8 text-zinc-900 mb-4" />
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Fast Workflows</h3>
                            <p className="text-zinc-600 text-sm">
                                Built for daily check-ins. Optimized for speed so you can focus on building.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
