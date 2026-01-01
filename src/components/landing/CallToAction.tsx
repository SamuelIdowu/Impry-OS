import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CallToAction() {
    return (
        <section className="py-24 bg-primary text-primary-foreground">
            <div className="container px-4 md:px-6 mx-auto text-center">
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                        Ready to streamline your business?
                    </h2>
                    <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                        Join today and get 14 days free. No credit card required.
                    </p>
                    <div className="flex flex-col gap-2 min-[400px]:flex-row justify-center pt-4">
                        <Link href="/dashboard">
                            <Button size="lg" variant="secondary" className="h-12 px-8 font-semibold">
                                Start Your Free Trial
                            </Button>
                        </Link>
                        <Link href="/contact">
                            <Button size="lg" variant="outline" className="h-12 px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                                Contact Sales
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
