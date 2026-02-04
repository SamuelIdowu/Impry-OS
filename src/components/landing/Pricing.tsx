import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const pricingTiers = [
    {
        name: "Starter",
        price: "79",
        period: "month",
        description: "Perfect for getting started",
        features: [
            "Up to 10 active clients",
            "Unlimited projects",
            "Follow-up reminders",
            "Basic scope tracking",
            "Payment tracking",
            "Email support",
        ],
        cta: "Get Started",
        highlighted: false,
    },
    {
        name: "Professional",
        price: "149",
        period: "month",
        description: "For growing freelancers",
        features: [
            "Unlimited clients",
            "Unlimited projects",
            "Advanced follow-up automation",
            "Full scope snapshot with sharing",
            "Payment tracking & reminders",
            "Project timeline & activity log",
            "Priority email support",
            "Custom branding",
        ],
        cta: "Get Started",
        highlighted: true,
    },
    {
        name: "Enterprise",
        price: "299",
        period: "month",
        description: "For teams and agencies",
        features: [
            "Everything in Professional",
            "Team collaboration (up to 5 users)",
            "Advanced reporting & analytics",
            "Custom integrations",
            "API access",
            "Dedicated account manager",
            "Phone & priority support",
            "Custom onboarding",
        ],
        cta: "Contact Sales",
        highlighted: false,
    },
];

export function Pricing() {
    return (
        <section id="pricing" className="bg-background py-20 md:py-28">
            <div className="container px-6 lg:px-10 mx-auto max-w-[1400px]">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                            Simple, transparent pricing
                        </h2>
                        <p className="mx-auto max-w-[700px] text-lg md:text-xl text-zinc-600">
                            Choose the plan that fits your needs. All plans include a 14-day free trial.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                    {pricingTiers.map((tier, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl border bg-white p-8 shadow-[0_2px_10px_rgba(0,0,0,0.03)] ${tier.highlighted
                                ? "border-zinc-900 shadow-[0_8px_30px_rgba(0,0,0,0.12)] scale-105"
                                : "border-zinc-200"
                                }`}
                        >
                            {tier.highlighted && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                    Most Popular
                                </div>
                            )}
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-zinc-900">{tier.name}</h3>
                                    <p className="text-sm text-zinc-600 mt-2">{tier.description}</p>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-bold tracking-tight text-zinc-900">
                                        ${tier.price}
                                    </span>
                                    <span className="text-zinc-600">/{tier.period}</span>
                                </div>
                                <Link href={tier.name === "Enterprise" ? "/contact" : "/register"} className="block">
                                    <Button
                                        className={`w-full h-12 text-base font-semibold rounded-lg ${tier.highlighted
                                            ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-900"
                                            }`}
                                    >
                                        {tier.cta}
                                    </Button>
                                </Link>
                                <ul className="space-y-3 pt-4">
                                    {tier.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-zinc-900 flex-shrink-0 mt-0.5" />
                                            <span className="text-sm text-zinc-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-zinc-600">
                        All plans include a 14-day free trial. No credit card required.
                    </p>
                </div>
            </div>
        </section>
    );
}
