import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CallToAction() {
    return (
        <section className="bg-[#fafafa] py-24 md:py-32">
            <div className="container px-6 lg:px-10 mx-auto max-w-[1400px] text-center">
                <div className="space-y-8 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-900">
                        Hey There, Create your{" "}
                        <span className="italic font-normal">free account</span>
                    </h2>
                    <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mx-auto">
                        Start protecting your revenue today. No credit card required. 14-day free trial on all plans.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Link href="/register">
                            <Button size="lg" className="h-14 px-10 text-base font-semibold rounded-lg">
                                Get Started Free
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

