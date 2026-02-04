import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Bell, Shield, DollarSign, Users, Clock, Zap } from "lucide-react";

const features = [
    {
        title: "Follow-Up Guard",
        description: "Never miss a follow-up again. Set reminders for proposals, unanswered messages, and invoices. Stay on top of every client interaction.",
        icon: Bell,
    },
    {
        title: "Scope Snapshot",
        description: "Protect against scope creep with clear deliverables, out-of-scope items, and timestamped updates. Share read-only links with clients.",
        icon: Shield,
    },
    {
        title: "Payment Tracking",
        description: "Track payment status, set milestones, and get reminders for overdue invoices. Ensure you get paid on time, every time.",
        icon: DollarSign,
    },
    {
        title: "Client Management",
        description: "Keep all client information in one place. Store contact details, project history, and notes for complete context.",
        icon: Users,
    },
    {
        title: "Project Timeline",
        description: "Chronological activity log of scope updates, invoices, payments, and notes. Search and review your entire project history.",
        icon: Clock,
    },
    {
        title: "Fast Workflows",
        description: "Built for daily check-ins. Optimized for speed and efficiency so you can focus on what you do best: delivering great work.",
        icon: Zap,
    },
];

export function Features() {
    return (
        <section id="features" className="bg-white py-20 md:py-28">
            <div className="container px-6 lg:px-10 mx-auto max-w-[1400px]">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                            Everything you need to protect your revenue
                        </h2>
                        <p className="mx-auto max-w-[700px] text-lg md:text-xl text-zinc-600">
                            A comprehensive suite of tools built specifically for freelance developers and designers who want to stay in control.
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            className="relative overflow-hidden border border-zinc-200 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                        >
                            <CardHeader className="pb-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center mb-4">
                                    <feature.icon className="w-6 h-6 text-zinc-900" />
                                </div>
                                <CardTitle className="text-xl font-bold text-zinc-900">{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base text-zinc-600 leading-relaxed">
                                    {feature.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
