import type { Metadata } from "next";
import { Montserrat_Alternates, Poppins } from "next/font/google";
import "./globals.css";
import { AuthListener } from "@/components/auth/AuthListener";
import { defaultMetadata } from "@/lib/metadata-config";

const montserratAlternates = Montserrat_Alternates({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-montserrat-alternates",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = defaultMetadata;

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserratAlternates.variable} ${poppins.variable}`}>
      <body className={`antialiased ${montserratAlternates.className}`}>
        <AuthListener />
        {children}
      </body>
    </html>
  );
}
