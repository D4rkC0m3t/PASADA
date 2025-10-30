"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Users, Folder, FileText, Package, Calendar, Settings, LogOut, Bell } from "lucide-react";

const menu = [
  { name: "Dashboard", icon: Home, href: "/client/dashboard" },
  { name: "Clients", icon: Users, href: "/admin/clients" },
  { name: "Projects", icon: Folder, href: "/client/projects" },
  { name: "Quotations", icon: FileText, href: "/client/quotations" },
  { name: "Materials", icon: Package, href: "/admin/materials" },
  { name: "Bookings", icon: Calendar, href: "/admin/bookings" },
  { name: "Settings", icon: Settings, href: "/admin/settings" },
];

export const Sidebar = () => {
  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-64 bg-[#1b1b1b] text-[#f3f3f3] flex flex-col justify-between h-screen p-4 border-r border-[#2b2b2b]"
    >
      <div>
        <h2 className="text-xl font-semibold text-yellow-400 mb-6">PASADA Groups</h2>
        <nav className="space-y-2">
          {menu.map((item) => (
            <Link href={item.href} key={item.name}>
              <motion.div
                whileHover={{ scale: 1.05, x: 4 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#2b2b2b] cursor-pointer w-full"
              >
                <item.icon size={18} className="text-yellow-400" />
                <span>{item.name}</span>
              </motion.div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 text-sm">
          <div className="flex items-center gap-2">
            <Bell size={16} />
            Notifications
          </div>
          <span className="bg-yellow-500 text-black rounded-full px-2 py-0.5 text-xs">3</span>
        </div>
        <button className="flex items-center gap-2 text-sm hover:text-yellow-400 transition">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </motion.aside>
  );
};
