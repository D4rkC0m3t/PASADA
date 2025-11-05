"use client";

import { motion } from "framer-motion";
import { Inbox, Send, Archive } from "lucide-react";

interface Mail {
  sender: string;
  subject: string;
  time: string;
}

export function MailPreview({ mails }: { mails: Mail[] }) {
  return (
    <motion.div
      whileHover={{ y: -6, boxShadow: "0 12px 34px rgba(0,0,0,0.6)" }}
      className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/70 to-neutral-800/30 backdrop-blur-lg p-6 shadow-md flex flex-col"
    >
      <div className="flex items-center gap-3 mb-4">
        <Inbox className="w-6 h-6 text-gold" />
        <h3 className="text-xl font-semibold">Mail Center</h3>
      </div>

      <div className="flex-1 space-y-3">
        {mails.map((m, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/40 hover:bg-neutral-800/40 transition">
            <div>
              <p className="text-sm font-medium text-white">{m.sender}</p>
              <p className="text-xs text-gray-400">{m.subject}</p>
            </div>
            <span className="text-xs text-gray-500">{m.time}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Send className="w-5 h-5 text-gray-400 hover:text-gold cursor-pointer transition" />
          <Archive className="w-5 h-5 text-gray-400 hover:text-gold cursor-pointer transition" />
        </div>

        <a className="text-sm text-gold hover:text-white font-medium transition cursor-pointer">Open full inbox →</a>
      </div>
    </motion.div>
  );
}
