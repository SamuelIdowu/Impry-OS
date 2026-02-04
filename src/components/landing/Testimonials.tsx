import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "UX Designer",
        content: "Impry OS changed how I manage my design business. I spend less time on admin and more time creating. The scope tracking alone has saved me countless hours of back-and-forth.",
        initials: "SC",
    },
    {
        name: "Marcus Rodriguez",
        role: "Full Stack Developer",
        content: "The best investment I've made for my freelance career. The follow-up reminders ensure I never miss an opportunity, and payment tracking keeps my cash flow healthy.",
        initials: "MR",
    },
    {
        name: "Emily Taylor",
        role: "Product Designer",
        content: "Finally, a tool that understands what freelancers actually need. Simple, powerful, and it actually helps me protect my revenue instead of just tracking it.",
        initials: "ET",
    },
];

export function Testimonials() {
    return (
        <section className="bg-white py-20 md:py-28">
            <div className="container px-6 lg:px-10 mx-auto max-w-[1400px]">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900">
                        Trusted by freelancers worldwide
                    </h2>
                    <p className="max-w-[700px] text-lg md:text-xl text-zinc-600">
                        Join thousands of independent professionals who rely on Impry OS to protect their revenue.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <Card
                            key={index}
                            className="border border-zinc-200 bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300"
                        >
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <Avatar className="w-12 h-12">
                                    <AvatarFallback className="bg-zinc-900 text-white font-semibold">
                                        {testimonial.initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <p className="text-base font-bold text-zinc-900">{testimonial.name}</p>
                                    <p className="text-sm text-zinc-600">{testimonial.role}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-zinc-700 leading-relaxed">{testimonial.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
