"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-neutral-800 bg-black/60 backdrop-blur-lg sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#D1A954] rounded-sm" />
        <div>
          <h1 className="text-xl font-semibold tracking-tight">PASADA</h1>
          <p className="text-xs text-gray-400 uppercase tracking-wider">INTERIOR GROUPS</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-6">
        <Link href="/" className="text-gray-400 hover:text-white transition">Home</Link>
        <Link href="/about" className="text-gray-400 hover:text-white transition">About</Link>
        <Link href="/services" className="text-gray-400 hover:text-white transition">Services</Link>
        <Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link>

        {/* Client Login button - matching GET IN TOUCH style */}
        <Link
          href="/login?type=client"
          className="px-5 py-2.5 border-2 border-white text-white rounded-full font-medium hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 group"
        >
          <span className="uppercase text-sm tracking-wide">Client Login</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <Link
          href="/login?type=client"
          className="px-4 py-2 border-2 border-white text-white rounded-full font-medium text-sm flex items-center gap-2"
        >
          <span className="uppercase text-xs tracking-wide">Login</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </nav>
  );
}
