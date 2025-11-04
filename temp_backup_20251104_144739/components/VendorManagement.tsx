"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Package, DollarSign, Clock } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

interface VendorStats {
  totalVendors: number;
  domesticVendors: number;
  foreignVendors: number;
  serviceProviders: number;
  consumables: number;
  capitalItems: number;
  pendingApprovals: number;
  paymentTerms: {
    code: string;
    description: string;
    count: number;
  }[];
}

export const VendorManagement = () => {
  const [stats, setStats] = useState<VendorStats>({
    totalVendors: 0,
    domesticVendors: 0,
    foreignVendors: 0,
    serviceProviders: 0,
    consumables: 0,
    capitalItems: 0,
    pendingApprovals: 0,
    paymentTerms: []
  });
  const [loading, setLoading] = useState(true);
  const [animatedCounts, setAnimatedCounts] = useState({
    total: 0,
    pending: 0
  });

  useEffect(() => {
    fetchVendorStats();
  }, []);

  // Animated counter effect
  useEffect(() => {
    if (!loading) {
      const duration = 2000;
      const steps = 60;
      const interval = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

        setAnimatedCounts({
          total: Math.floor(easeOutExpo * stats.totalVendors),
          pending: Math.floor(easeOutExpo * stats.pendingApprovals)
        });

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedCounts({
            total: stats.totalVendors,
            pending: stats.pendingApprovals
          });
        }
      }, interval);

      return () => clearInterval(timer);
    }
  }, [loading, stats.totalVendors, stats.pendingApprovals]);

  const fetchVendorStats = async () => {
    try {
      const supabase = createBrowserClient();

      // Fetch all vendors
      const { data: vendors, error } = await supabase
        .from('vendors')
        .select('*');

      if (error) throw error;

      // Calculate stats
      const total = vendors?.length || 0;
      const domestic = vendors?.filter(v => v.country === 'India' || v.country === 'IN').length || 0;
      const foreign = total - domestic;

      // Category breakdown
      const serviceProviders = vendors?.filter(v => v.category === 'service_provider').length || 0;
      const consumables = vendors?.filter(v => v.category === 'consumables').length || 0;
      const capitalItems = vendors?.filter(v => v.category === 'capital_items').length || 0;

      // Payment terms breakdown
      const paymentTermsMap: Record<string, number> = {};
      vendors?.forEach(v => {
        if (v.payment_terms) {
          paymentTermsMap[v.payment_terms] = (paymentTermsMap[v.payment_terms] || 0) + 1;
        }
      });

      const paymentTerms = [
        { code: 'Z010', description: '30 days from invoice', count: paymentTermsMap['Z010'] || 0 },
        { code: 'Z012', description: '45 days from invoice', count: paymentTermsMap['Z012'] || 0 },
        { code: 'Z014', description: '100% Advance', count: paymentTermsMap['Z014'] || 0 }
      ];

      // Pending approvals (vendors with status 'pending')
      const pending = vendors?.filter(v => v.status === 'pending').length || 0;

      setStats({
        totalVendors: total,
        domesticVendors: domestic,
        foreignVendors: foreign,
        serviceProviders,
        consumables,
        capitalItems,
        pendingApprovals: pending,
        paymentTerms
      });
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-pasada-950 border border-pasada-800 rounded-2xl p-6 animate-pulse">
            <div className="h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  const categoryPercentages = {
    service: stats.totalVendors > 0 ? (stats.serviceProviders / stats.totalVendors) * 100 : 0,
    consumables: stats.totalVendors > 0 ? (stats.consumables / stats.totalVendors) * 100 : 0,
    capital: stats.totalVendors > 0 ? (stats.capitalItems / stats.totalVendors) * 100 : 0
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="hero-number text-3xl mb-2">Vendor Management</h2>
        <p className="body-text">Track your suppliers and service providers</p>
      </motion.div>

      {/* Vendor Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Vendors Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="glass-stat-card relative overflow-hidden group hover:border-blue-500/30"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                Active
              </span>
            </div>

            {/* Label */}
            <h3 className="label-text mb-2">Total Vendors</h3>

            {/* Value */}
            <div className="hero-number text-5xl mb-4">
              {animatedCounts.total}
            </div>

            {/* Stats Breakdown */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-pasada-900/50 rounded-lg p-3 border border-pasada-700">
                <div className="meta-text mb-1">Domestic</div>
                <div className="hero-number text-xl">{stats.domesticVendors}</div>
              </div>
              <div className="bg-pasada-900/50 rounded-lg p-3 border border-pasada-700">
                <div className="meta-text mb-1">Foreign</div>
                <div className="hero-number text-xl">{stats.foreignVendors}</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Vendor Categories Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="glass-stat-card relative overflow-hidden group hover:border-gold-500/30"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-gold-500/10 group-hover:bg-gold-500/20 transition-colors">
                <Package className="w-6 h-6 text-gold-400" />
              </div>
              <span className="glass-badge" style={{ color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
                Categories
              </span>
            </div>

            {/* Label */}
            <h3 className="label-text mb-4">Distribution</h3>

            {/* Category Bars */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-pasada-300 mb-1">
                  <span>Service Provider</span>
                  <span className="font-semibold">{stats.serviceProviders}</span>
                </div>
                <div className="h-2 bg-pasada-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${categoryPercentages.service}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-pasada-300 mb-1">
                  <span>Consumables</span>
                  <span className="font-semibold">{stats.consumables}</span>
                </div>
                <div className="h-2 bg-pasada-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${categoryPercentages.consumables}%` }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-pasada-300 mb-1">
                  <span>Capital Items</span>
                  <span className="font-semibold">{stats.capitalItems}</span>
                </div>
                <div className="h-2 bg-pasada-900 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${categoryPercentages.capital}%` }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Payment Terms Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="glass-stat-card relative overflow-hidden group hover:border-green-500/30"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                Payment Terms
              </span>
            </div>

            {/* Label */}
            <h3 className="label-text mb-4">Popular Terms</h3>

            {/* Payment Terms List */}
            <div className="space-y-2">
              {stats.paymentTerms.map((term, idx) => (
                <motion.div
                  key={term.code}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + idx * 0.1 }}
                  className="flex items-center justify-between p-2 bg-pasada-900/50 rounded-lg border border-pasada-700 hover:border-green-500/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gold-400">{term.code}</div>
                    <div className="text-xs text-pasada-300">{term.description}</div>
                  </div>
                  <div className="hero-number text-lg">{term.count}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Pending Approvals Widget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="glass-stat-card relative overflow-hidden group hover:border-red-500/30"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                <Clock className="w-6 h-6 text-red-400" />
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse">
                Action Required
              </span>
            </div>

            {/* Label */}
            <h3 className="label-text mb-2">Pending Approvals</h3>

            {/* Value */}
            <div className="hero-number text-5xl mb-4">
              {animatedCounts.pending}
            </div>

            {/* Approval List */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between p-2 bg-pasada-900/50 rounded-lg border border-pasada-700">
                <span className="text-xs text-pasada-300">New Vendor Requests</span>
                <span className="meta-text font-semibold">{Math.floor(stats.pendingApprovals * 0.6)} pending</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-pasada-900/50 rounded-lg border border-pasada-700">
                <span className="text-xs text-pasada-300">Modifications</span>
                <span className="meta-text font-semibold">{Math.floor(stats.pendingApprovals * 0.4)} pending</span>
              </div>
            </div>

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="glass-button w-full py-3 flex items-center justify-center gap-2"
            >
              Review Now
              <span>→</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
