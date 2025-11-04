"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Home, Users, Folder, FileText, Package, Calendar, Settings, LogOut, Bell, FileCheck, Clock, CreditCard, Calculator, Receipt } from "lucide-react";
import { createBrowserClient } from "@/lib/supabase/client";

// Admin menu items
const adminMenu = [
  { name: "Dashboard", icon: Home, href: "/admin/dashboard" },
  { name: "Clients", icon: Users, href: "/admin/clients" },
  { name: "Projects", icon: Folder, href: "/admin/projects" },
  { name: "Estimations", icon: Calculator, href: "/admin/estimations" },
  { name: "Quotations", icon: FileText, href: "/admin/quotations" },
  { name: "E-Invoice", icon: Receipt, href: "/admin/invoices" },
  { name: "Materials", icon: Package, href: "/admin/materials" },
  { name: "Bookings", icon: Calendar, href: "/admin/bookings" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

// Client menu items
const clientMenu = [
  { name: "Dashboard", icon: Home, href: "/client/dashboard" },
  { name: "My Projects", icon: Folder, href: "/client/projects" },
  { name: "Quotations", icon: FileCheck, href: "/client/quotations" },
  { name: "Schedule", icon: Clock, href: "/client/schedule" },
  { name: "Payments", icon: CreditCard, href: "/client/payments" },
  { name: "Settings", icon: Settings, href: "/client/settings" },
];

export const Sidebar = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [menu, setMenu] = useState(clientMenu);
  const pathname = usePathname();
  const supabase = createBrowserClient();

  useEffect(() => {
    async function getUserRole() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUserRole(profile.role);
            setMenu(profile.role === 'admin' || profile.role === 'staff' ? adminMenu : clientMenu);
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    }

    getUserRole();
  }, [supabase]);

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const isAdmin = userRole === 'admin' || userRole === 'staff';

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className={`w-64 flex flex-col justify-between h-screen p-6 border-r ${isAdmin 
        ? 'bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] border-[#2b2b2b]' 
        : 'bg-gradient-to-b from-[#0a1a2a] to-[#050f1a] border-[#1a2a3a]'}`}
    >
      <div>
        {/* Logo Section */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className={`text-2xl font-bold tracking-wide ${isAdmin ? 'text-gold-400' : 'text-blue-400'}`}>
            PASADA
            <span className="block text-xs mt-1 opacity-70 font-normal tracking-wider">
              {userRole === 'admin' ? 'Admin Portal' : userRole === 'staff' ? 'Staff Portal' : 'Client Portal'}
            </span>
          </h2>
        </motion.div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menu.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link href={item.href} key={item.name}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                    isActive 
                      ? isAdmin
                        ? 'bg-gold-500/20 border-l-3 border-gold-500 text-gold-400'
                        : 'bg-blue-500/20 border-l-3 border-blue-500 text-blue-400'
                      : isAdmin 
                        ? 'hover:bg-[#2b2b2b] text-[#f3f3f3]' 
                        : 'hover:bg-[#1a2a3a] text-[#f3f3f3]'
                  }`}
                  style={{
                    borderLeft: isActive ? `3px solid ${isAdmin ? '#f5c542' : '#3b82f6'}` : 'none'
                  }}
                >
                  <item.icon 
                    size={20} 
                    className={isActive ? (isAdmin ? 'text-gold-400' : 'text-blue-400') : 'text-gray-400'} 
                  />
                  <span className="font-medium text-sm tracking-wide">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4">
        {/* Notifications */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-between px-3 py-2 text-sm rounded-lg bg-[#1a1a1a]/50 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-gray-400" />
            <span className="text-[#f3f3f3]">Notifications</span>
          </div>
          <motion.span 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`${isAdmin ? 'bg-gold-500' : 'bg-blue-500'} text-black rounded-full px-2 py-0.5 text-xs font-bold`}
          >
            {userRole === 'admin' ? '5' : '2'}
          </motion.span>
        </motion.div>

        {/* Logout Button */}
        <motion.button 
          onClick={handleLogout}
          whileHover={{ scale: 1.02, x: 2 }}
          whileTap={{ scale: 0.98 }}
          className={`flex items-center gap-2 text-sm transition w-full p-3 rounded-lg ${
            isAdmin 
              ? 'hover:bg-red-500/20 hover:text-red-400' 
              : 'hover:bg-red-500/20 hover:text-red-400'
          } text-gray-400`}
        >
          <LogOut size={16} /> 
          <span className="font-medium">Logout</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};
