import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, FileText, Briefcase, Clock, ShieldCheck, Zap } from "lucide-react";

const features = [
    {
        title: "Client Management",
        description: "Keep track of all your clients in one place. Store contact details, notes, and project history.",
        icon: Users,
    },
    {
        title: "Smart Invoicing",
        description: "Create and send professional invoices in seconds. Track payments and follow up on overdue bills.",
        icon: FileText,
    },
    {
        title: "Project Tracking",
        description: "Manage multiple projects with ease. visualize progress, set milestones, and never miss a deadline.",
        icon: Briefcase,
    },
    {
        title: "Time Tracking",
        description: "Log hours for every task. Generate reports to see where your time goes and bill accurately.",
        icon: Clock,
    },
    {
        title: "Scope Management",
        description: "Define project scope clearly to avoid scope creep. Get client approval on deliverables upfront.",
        icon: ShieldCheck,
    },
    {
        title: "Fast Workflows",
        description: "Automate repetitive tasks and focus on what you do best. Built for speed and efficiency.",
        icon: Zap,
    },
];

export function Features() {
    return (
        <section id="features" className="container px-4 md:px-6 py-24 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                        Everything you need to run your business
                    </h2>
                    <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        A comprehensive suite of tools built specifically for freelancers and independent contractors.
                    </p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                    <Card key={index} className="relative overflow-hidden border-border/50 bg-background/50 hover:bg-background/80 hover:shadow-md transition-all">
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                                <feature.icon className="w-6 h-6 text-primary" />
                            </div>
                            <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-base">{feature.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    );
}
