"use client";

import { motion } from "framer-motion";
import { Navbar } from "./components/navbar";
import { PortalCard } from "./components/portal-card";
import { MailPreview } from "./components/mail-preview";
import { Shield, User } from "lucide-react";

export default function CRMPortalPage() {
  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      {/* animated background */}
      <div className="absolute inset-0 -z-10 animated-bg" />

      <Navbar />

      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-14">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center mb-12 max-w-4xl"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            Welcome to <span className="text-gold">CRM Portal</span>
          </h1>
          <p className="mt-4 text-gray-300 text-lg">
            Manage your interior design projects, clients, and communications — all in a beautifully crafted workspace.
          </p>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="grid gap-8 md:grid-cols-3 w-full max-w-6xl"
        >
          <PortalCard
            title="Admin Portal"
            icon={<Shield className="w-7 h-7 text-gold" />}
            description="Full access to manage clients, projects, materials and analytics."
            link="/login?type=admin"
            cta="Enter Admin"
            accent="gold"
          />

          <MailPreview
            mails={[
              { sender: "Priya Singh", subject: "New quotation request", time: "2h ago" },
              { sender: "Rajesh Kumar", subject: "Invoice payment", time: "5h ago" },
              { sender: "Design Team", subject: "Kickoff meeting notes", time: "1d ago" },
            ]}
          />

          <PortalCard
            title="Client Portal"
            icon={<User className="w-7 h-7 text-gold" />}
            description="View your projects, quotations, and messages from the design team."
            link="/login?type=client"
            cta="Enter Client"
            accent="gold"
          />
        </motion.div>

        <footer className="mt-12 text-sm text-gray-500">
          © {new Date().getFullYear()} PASADA Groups · <span className="underline cursor-pointer hover:text-gray-400">Privacy</span> · <span className="underline cursor-pointer hover:text-gray-400">Terms</span>
        </footer>
      </main>
    </div>
  );
}
