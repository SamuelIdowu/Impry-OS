import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const testimonials = [
    {
        name: "Sarah Chen",
        role: "UX Designer",
        content: "Impry OS changed how I manage my design business. I spend less time on admin and more time creating.",
        initials: "SC",
    },
    {
        name: "Marcus Rodriguez",
        role: "Full Stack Developer",
        content: "The best investment I've made for my freelance career. The project tracking features are incredible.",
        initials: "MR",
    },
    {
        name: "Emily Taylor",
        role: "Content Strategist",
        content: "Finally, a tool that understands what freelancers actually need. Simple, powerful, and beautiful.",
        initials: "ET",
    },
];

export function Testimonials() {
    return (
        <section className="bg-muted/50 py-24">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                        Trusted by freelancers worldwide
                    </h2>
                    <p className="max-w-[600px] text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed">
                        Join thousands of independent professionals who rely on Impry OS daily.
                    </p>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="border-none shadow-sm">
                            <CardHeader className="flex flex-row items-center gap-4 pb-4">
                                <Avatar>
                                    <AvatarFallback>{testimonial.initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                    <p className="text-sm font-medium leading-none">{testimonial.name}</p>
                                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{testimonial.content}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
