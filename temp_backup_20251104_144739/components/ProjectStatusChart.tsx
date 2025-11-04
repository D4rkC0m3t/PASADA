"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

const sample = [
  { status: "Design", count: 6 },
  { status: "Procurement", count: 4 },
  { status: "Execution", count: 7 },
  { status: "Handover", count: 2 },
];

const colors = ["#D4AF37", "#f5c542", "#ff7043", "#ef5350"];

export const ProjectStatusChart = ({ data = sample }: { data?: { status: string; count: number }[] }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.6, delay: 0.1, type: "spring" }}
      className="glassmorphic-card p-6 h-80 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="card-title">Projects by Stage</h3>
          <p className="body-text text-xs mt-1">Active project distribution</p>
        </div>
        <span className="glass-badge glass-info">
          {data.reduce((sum, d) => sum + d.count, 0)} Total
        </span>
      </div>

      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
            <XAxis 
              type="number" 
              tick={{ fill: "#b3b3b3", fontSize: 12 }}
              axisLine={{ stroke: "#2a2a2a" }}
            />
            <YAxis 
              dataKey="status" 
              type="category" 
              axisLine={false} 
              tick={{ fill: "#b3b3b3", fontSize: 12 }}
              width={100}
            />
            <Tooltip 
              contentStyle={{ 
                background: "rgba(15, 15, 15, 0.95)", 
                border: "1px solid rgba(245, 197, 66, 0.3)",
                borderRadius: "10px",
                backdropFilter: "blur(10px)",
                color: "#fff8f1",
                fontWeight: "600"
              }}
              cursor={{ fill: "rgba(255, 255, 255, 0.05)" }}
            />
            <Bar 
              dataKey="count" 
              animationDuration={1200}
              radius={[0, 8, 8, 0]}
            >
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
