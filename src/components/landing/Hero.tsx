import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export function Hero() {
    return (
        <section className="relative overflow-hidden pt-16 md:pt-24 lg:pt-32">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="space-y-2">
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-4">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                            Now standard with Impry OS
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                            Manage your freelance business <br className="hidden sm:inline" />
                            <span className="text-primary">with absolute clarity</span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                            Stop juggling spreadsheets and emails. Track clients, invoices, and projects in one diverse operating system designed for growth.
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row">
                        <Link href="/dashboard">
                            <Button size="lg" className="h-12 px-8">
                                Get Started
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button size="lg" variant="outline" className="h-12 px-8">
                                View Demo
                            </Button>
                        </Link>
                    </div>
                    <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground pt-8">
                        <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                            <span>No credit card required</span>
                        </div>
                        <div className="flex items-center">
                            <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                            <span>14-day free trial</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Abstract Background Gradient */}
            <div className="absolute top-0 z-[-1] h-screen w-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        </section>
    );
}
