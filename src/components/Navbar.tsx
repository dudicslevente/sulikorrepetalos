"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/piacter", label: "Piactér" },
    { href: "/hirdetesfeladas", label: "Hirdetésfeladás" },
    { href: "/foglalasaim", label: "Foglalásaim" },
    { href: "/profil", label: "Profilom" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/piacter" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-800 rounded-md flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-semibold text-xl tracking-tight text-primary-950">
              [Iskola neve]
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-primary-800 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={() => signOut({ callbackUrl: "/bejelentkezes" })}
              className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors"
            >
              <LogOut size={16} />
              Kijelentkezés
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-primary-800"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 space-y-3 shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="block text-base font-medium text-slate-700 hover:text-primary-800"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/bejelentkezes" });
            }}
            className="block w-full text-left text-base font-medium text-red-600 hover:text-red-800 pt-2 border-t border-gray-100"
          >
            Kijelentkezés
          </button>
        </div>
      )}
    </nav>
  );
}