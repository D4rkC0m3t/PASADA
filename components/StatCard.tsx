"use client";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { Users, FileText, DollarSign, Calendar } from "lucide-react";

const icons = {
  clients: Users,
  quotations: FileText,
  revenue: DollarSign,
  meetings: Calendar,
};

interface StatCardProps {
  type: keyof typeof icons;
  value: number;
  trend: string;
  label: string;
  delay?: number;
}

export const StatCard = ({ type, value, trend, label, delay = 0 }: StatCardProps) => {
  const Icon = icons[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3, scale: 1.02 }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 200 }}
      className="glassmorphism-card p-6 flex flex-col gap-3 group cursor-pointer"
    >
      <div className="flex justify-between items-center">
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-600/10"
        >
          <Icon className="text-gold-400" size={22} />
        </motion.div>
        <span className="text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      </div>
      <h2 className="text-3xl font-bold text-[#fff8f1] tracking-tight">
        {type === "revenue" ? "₹" : ""}
        <CountUp end={value} duration={1.5} separator="," />
        {type === "revenue" && "L"}
      </h2>
      <p className="text-sm text-[#b3b3b3] font-medium tracking-wide">{label}</p>
    </motion.div>
  );
};
