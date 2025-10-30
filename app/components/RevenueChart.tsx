"use client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

type DataPoint = { date: string; revenue: number };

const sampleData: DataPoint[] = [
  { date: "Jan", revenue: 6.5 },
  { date: "Feb", revenue: 7.2 },
  { date: "Mar", revenue: 8.0 },
  { date: "Apr", revenue: 10.1 },
  { date: "May", revenue: 9.6 },
  { date: "Jun", revenue: 12.4 },
];

export const RevenueChart = ({ data = sampleData }: { data?: DataPoint[] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#151515] rounded-2xl p-4 border border-[#2a2a2a] h-64"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">Revenue Trend</h3>
        <span className="text-xs text-gray-400">Last 6 months</span>
      </div>

      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f6d365" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#f6d365" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#222" strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fill: "#aaa", fontSize: 12 }} />
            <YAxis tickFormatter={(v) => `${v}L`} tick={{ fill: "#aaa", fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                background: "#181818", 
                border: "1px solid #2a2a2a",
                borderRadius: "8px"
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f6d365" 
              fill="url(#grad)" 
              strokeWidth={2} 
              animationDuration={1200} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
