"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Logo } from "@/components/ui/logo";
import { Menu } from "lucide-react";

export function MobileNav() {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Toggle menu</span>
                </Button>
            </DialogTrigger>
            <DialogTitle className="sr-only">Mobile Navigation</DialogTitle>
            <DialogDescription className="sr-only">Mobile Navigation Menu</DialogDescription>
            <DialogContent className="fixed inset-0 z-50 w-screen h-screen max-w-full m-0 border-0 rounded-none bg-background p-0 sm:max-w-full translate-x-0 translate-y-0 top-0 left-0 data-[state=open]:slide-in-from-bottom-0 data-[state=closed]:slide-out-to-bottom-0">
                <div className="flex flex-col h-full">
                    <div className="flex h-16 items-center px-6 border-b border-zinc-100">
                        <Logo textClassName="text-xl font-bold text-zinc-900" />
                        <div className="ml-auto">
                            {/* Close button is handled by DialogContent's default close button */}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-8">
                        <nav className="flex flex-col gap-8 text-lg font-medium">
                            <Link
                                href="#features"
                                className="text-zinc-900 hover:text-zinc-600 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                Features
                            </Link>
                            <Link
                                href="#pricing"
                                className="text-zinc-900 hover:text-zinc-600 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                Pricing
                            </Link>
                            <Link
                                href="#"
                                className="text-zinc-900 hover:text-zinc-600 transition-colors"
                                onClick={() => setOpen(false)}
                            >
                                About
                            </Link>
                        </nav>
                        <div className="mt-12 flex flex-col gap-4">
                            <Link href="/login" onClick={() => setOpen(false)}>
                                <Button variant="outline" size="lg" className="w-full text-base">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/register" onClick={() => setOpen(false)}>
                                <Button size="lg" className="w-full text-base bg-zinc-900 text-white hover:bg-zinc-800">
                                    Get Started
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
