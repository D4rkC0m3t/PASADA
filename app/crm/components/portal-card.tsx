"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  title: string;
  icon: React.ReactNode;
  description: string;
  link: string;
  cta?: string;
  accent?: "gold" | "white";
}

export function PortalCard({ title, icon, description, link, cta = "Enter", accent = "gold" }: Props) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 10px 30px rgba(0,0,0,0.6)" }}
      className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/70 to-neutral-800/30 backdrop-blur-lg p-6 shadow-md flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-md bg-neutral-900/40">{icon}</div>
          <h3 className="text-xl font-semibold">{title}</h3>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Link
          href={link}
          className={`text-sm font-medium ${accent === "gold" ? "text-gold" : "text-white"} hover:text-white transition`}
        >
          {cta} →
        </Link>

        <div className={`w-10 h-10 rounded-md ${accent === "gold" ? "bg-gold/10" : "bg-white/5"} flex items-center justify-center`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h14" stroke={accent === "gold" ? "#D1A954" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 5l7 7-7 7" stroke={accent === "gold" ? "#D1A954" : "#fff"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
