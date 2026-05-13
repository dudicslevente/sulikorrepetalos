import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "Sulikorrepetálós",
  description: "Iskolai korrepetálás egyszerűen.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="hu">
      <body className={`${inter.className} bg-[#f9f9f8] text-slate-800 min-h-screen flex flex-col`}>
        <Providers>
          {session && <Navbar />}
          <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}