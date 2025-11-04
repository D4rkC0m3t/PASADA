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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: "spring" }}
      className="glassmorphic-card p-6 h-80 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="card-title">Revenue Trend</h3>
          <p className="body-text text-xs mt-1">Last 6 months performance</p>
        </div>
        <span className="glass-badge" style={{ color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
          ↗ Growing
        </span>
      </div>

      <div className="w-full flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#b8941f" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#2a2a2a" strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tick={{ fill: "#b3b3b3", fontSize: 12 }} 
              axisLine={{ stroke: "#2a2a2a" }}
            />
            <YAxis 
              tickFormatter={(v) => `₹${v}L`} 
              tick={{ fill: "#b3b3b3", fontSize: 12 }}
              axisLine={{ stroke: "#2a2a2a" }}
            />
            <Tooltip 
              contentStyle={{ 
                background: "rgba(15, 15, 15, 0.95)", 
                border: "1px solid rgba(245, 197, 66, 0.3)",
                borderRadius: "10px",
                backdropFilter: "blur(10px)",
                color: "#f5c542",
                fontWeight: "600"
              }}
              labelStyle={{ color: "#fff8f1" }}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#D4AF37" 
              fill="url(#revenueGradient)" 
              strokeWidth={3} 
              animationDuration={1500}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
