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
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      className="bg-[#252525] rounded-2xl p-4 flex flex-col gap-2 border border-[#333]"
    >
      <div className="flex justify-between items-center">
        <Icon className="text-yellow-400" size={20} />
        <span className="text-xs text-green-400">{trend}</span>
      </div>
      <h2 className="text-2xl font-bold text-white">
        {type === "revenue" ? "₹" : ""}
        <CountUp end={value} duration={1.5} />
        {type === "revenue" && "L"}
      </h2>
      <p className="text-sm text-gray-400">{label}</p>
    </motion.div>
  );
};
