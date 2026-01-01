import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Authentication - FreelanceOS",
    description: "Sign in or create an account",
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background blur effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gray-200/40 blur-[120px]" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-gray-100/50 blur-[100px]" />
            </div>

            {/* Content */}
            <div className="relative w-full max-w-[420px] z-10">
                {children}
            </div>
        </div>
    );
}
