"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

const sample = [
  { status: "Design", count: 6 },
  { status: "Procurement", count: 4 },
  { status: "Execution", count: 7 },
  { status: "Handover", count: 2 },
];

const colors = ["#eab308", "#f59e0b", "#f97316", "#ef4444"];

export const ProjectStatusChart = ({ data = sample }: { data?: { status: string; count: number }[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 12 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, delay: 0.05 }}
      className="bg-[#151515] rounded-2xl p-4 border border-[#2a2a2a] h-64"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Projects by Stage</h3>
        <span className="text-xs text-gray-400">Active projects</span>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
            <XAxis type="number" tick={{ fill: "#aaa", fontSize: 12 }} />
            <YAxis dataKey="status" type="category" axisLine={false} tick={{ fill: "#aaa", fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                background: "#181818", 
                border: "1px solid #2a2a2a",
                borderRadius: "8px"
              }} 
            />
            <Bar dataKey="count" animationDuration={800}>
              {data.map((_, idx) => (
                <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
