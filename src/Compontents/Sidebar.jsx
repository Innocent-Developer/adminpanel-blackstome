// src/components/Sidebar.jsx
import {
  Home,
  Users,
  Wallet,
  DollarSign,
  MessageSquare,
  Star,
  Trophy,
  Package,
  BarChart2,
  Gift,
  Mic,
  UserCheck,
  Image,
  MessageCircle,
  Settings,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const menuItems = [
  { label: "Wallet", icon: Wallet },
  { label: "Charge System", icon: Star },
  { label: "AdminMassege", icon: MessageCircle },
  { label: "Banner", icon: Image },
  { label: "Achievements", icon: Trophy },
  { label: "Sales", icon: Package },
  { label: "Level", icon: BarChart2 },
  { label: "Lucky Box", icon: Gift },
  { label: "Room", icon: Mic },
  { label: "Agency System", icon: UserCheck },
  { label: "Posts", icon: Image },
  { label: "Group Chat", icon: MessageCircle },
  { label: "App Settings", icon: Settings },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="md:hidden p-4 flex justify-between items-center bg-[#1a1a1a] text-white">
        <h2 className="text-lg font-bold">King Maker</h2>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`bg-[#1a1a1a] text-white w-64 h-screen p-4 space-y-6 z-40 overflow-y-auto transition-all duration-300
        ${isOpen ? "block fixed top-0 left-0" : "hidden"} md:block md:static`}
      >
        <h2 className="text-xl font-bold mb-6 hidden md:block">King Maker</h2>

        <ul className="space-y-2">
          <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#333] ${isActive ? "bg-[#333]" : ""}`}> <Home className="w-5 h-5" /><span>Dashboard</span></NavLink>
          <NavLink to="/users" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#333] ${isActive ? "bg-[#333]" : ""}`}> <Users className="w-5 h-5" /><span>Users</span></NavLink>

          <li>
            <button onClick={() => setWithdrawOpen(!withdrawOpen)} className="w-full flex items-center justify-between px-4 py-2 hover:bg-[#333] rounded-md">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5" /> <span>Withdraws</span>
              </div>
              {withdrawOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {withdrawOpen && (
              <ul className="ml-6 mt-1 space-y-1">
                <NavLink to="/withdraws/requests" className="block px-3 py-1 rounded hover:bg-[#333] text-sm">Requests</NavLink>
                <NavLink to="/Approve-withdraw" className="block px-3 py-1 rounded hover:bg-[#333] text-sm">Approve withdraw</NavLink>
                <NavLink to="/withdraws/history" className="block px-3 py-1 rounded hover:bg-[#333] text-sm">History</NavLink>
              </ul>
            )}
          </li>

          <NavLink to="/feedback" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#333] ${isActive ? "bg-[#333]" : ""}`}> <MessageSquare className="w-5 h-5" /><span>FeedBack</span></NavLink>

          {menuItems.map(({ label, icon: Icon }, idx) => (
            <NavLink key={idx} to={`/${label.toLowerCase().replace(/\s+/g, "-")}`} className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md hover:bg-[#333] ${isActive ? "bg-[#333]" : ""}`}> <Icon className="w-5 h-5" /><span>{label}</span></NavLink>
          ))}
        </ul>
      </div>
    </>
  );
}
