"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Eye, Users, Clock, TrendingUp } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  avgDuration: number;
  topPages: { page_name: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

export const VisitorAnalytics = ({ days = 7 }: { days?: number }) => {
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitorStats();
  }, [days]);

  const fetchVisitorStats = async () => {
    try {
      const supabase = createBrowserClient();
      const since = new Date();
      since.setDate(since.getDate() - days);

      // Total visits
      const { count: totalVisits } = await supabase
        .from('visitors')
        .select('*', { count: 'exact', head: true })
        .gte('visited_at', since.toISOString());

      // Unique visitors
      const { data: uniqueData } = await supabase
        .from('visitors')
        .select('session_id')
        .gte('visited_at', since.toISOString());
      
      const uniqueVisitors = new Set(uniqueData?.map(v => v.session_id)).size;

      // Average duration
      const { data: durationData } = await supabase
        .from('visitors')
        .select('duration_seconds')
        .gte('visited_at', since.toISOString())
        .not('duration_seconds', 'is', null);

      const avgDuration = durationData && durationData.length > 0
        ? Math.round(durationData.reduce((sum, v) => sum + (v.duration_seconds || 0), 0) / durationData.length)
        : 0;

      // Top pages
      const { data: pagesData } = await supabase
        .from('visitors')
        .select('page_name')
        .gte('visited_at', since.toISOString())
        .not('page_name', 'is', null);

      const pageCounts = (pagesData || []).reduce((acc: any, v) => {
        acc[v.page_name] = (acc[v.page_name] || 0) + 1;
        return acc;
      }, {});

      const topPages = Object.entries(pageCounts)
        .map(([page_name, count]) => ({ page_name, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Top referrers
      const { data: referrersData } = await supabase
        .from('visitors')
        .select('referrer')
        .gte('visited_at', since.toISOString())
        .not('referrer', 'is', null)
        .neq('referrer', '');

      const referrerCounts = (referrersData || []).reduce((acc: any, v) => {
        acc[v.referrer] = (acc[v.referrer] || 0) + 1;
        return acc;
      }, {});

      const topReferrers = Object.entries(referrerCounts)
        .map(([referrer, count]) => ({ referrer, count: count as number }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalVisits: totalVisits || 0,
        uniqueVisitors,
        avgDuration,
        topPages,
        topReferrers
      });
    } catch (error) {
      console.error('Error fetching visitor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#151515] rounded-2xl p-6 border border-[#2a2a2a] h-64 flex items-center justify-center">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-[#151515] rounded-2xl p-6 border border-[#2a2a2a]">
        <div className="text-gray-400">No visitor data available</div>
      </div>
    );
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-[#151515] rounded-2xl p-6 border border-[#2a2a2a]"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-[#fff8f1]">Visitor Analytics</h3>
        <span className="text-xs text-gray-400">Last {days} days</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#222]">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Total Visits</span>
          </div>
          <div className="text-2xl font-bold text-[#fff8f1]">{stats.totalVisits.toLocaleString()}</div>
        </div>

        <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#222]">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Unique Visitors</span>
          </div>
          <div className="text-2xl font-bold text-[#fff8f1]">{stats.uniqueVisitors.toLocaleString()}</div>
        </div>

        <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#222]">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Avg. Duration</span>
          </div>
          <div className="text-2xl font-bold text-[#fff8f1]">{formatDuration(stats.avgDuration)}</div>
        </div>

        <div className="bg-[#0f0f0f] rounded-lg p-4 border border-[#222]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Conversion</span>
          </div>
          <div className="text-2xl font-bold text-[#fff8f1]">-</div>
        </div>
      </div>

      {/* Top Pages & Referrers */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div>
          <h4 className="text-sm font-semibold text-[#fff8f1] mb-3">Top Pages</h4>
          <div className="space-y-2">
            {stats.topPages.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded border border-[#222]">
                <span className="text-sm text-gray-300 truncate">{page.page_name}</span>
                <span className="text-xs text-gray-400 ml-2">{page.count}</span>
              </div>
            ))}
            {stats.topPages.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">No page data</div>
            )}
          </div>
        </div>

        {/* Top Referrers */}
        <div>
          <h4 className="text-sm font-semibold text-[#fff8f1] mb-3">Top Referrers</h4>
          <div className="space-y-2">
            {stats.topReferrers.map((ref, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-[#0f0f0f] rounded border border-[#222]">
                <span className="text-sm text-gray-300 truncate">{new URL(ref.referrer).hostname}</span>
                <span className="text-xs text-gray-400 ml-2">{ref.count}</span>
              </div>
            ))}
            {stats.topReferrers.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">No referrer data</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
