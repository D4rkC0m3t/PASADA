"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function Navbar() {
  return (
    <nav className="w-full border-b border-neutral-800 bg-black/30 backdrop-blur-lg py-4 px-6 flex items-center justify-between fixed top-0 z-20">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-sm bg-gold/95 shadow-sm flex items-center justify-center text-black font-bold">P</div>
        <div>
          <div className="text-lg font-semibold leading-none">PASADA</div>
          <div className="text-xs tracking-wider text-gray-400">GROUPS</div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-300">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <Link href="/about" className="hover:text-white transition">About</Link>
          <Link href="/contact" className="hover:text-white transition">Contact</Link>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gold hover:text-white transition text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Website
        </Link>
      </div>
    </nav>
  );
}
