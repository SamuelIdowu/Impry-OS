import Link from "next/link";
import { Boxes } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t py-12 bg-background">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Boxes className="h-6 w-6" />
                            <span className="text-lg font-bold">Freelancer OS</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            The complete operating system for independent freelancers and agencies.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Product</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Integrations</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Changelog</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Resources</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Documentation</Link></li>
                            <li><Link href="#" className="hover:text-foreground">API Reference</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Community</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">Legal</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
                            <li><Link href="#" className="hover:text-foreground">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row items-center justify-between mt-12 pt-8 border-t">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Freelancer Client OS. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {/* Social icons could go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
