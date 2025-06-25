import {
  Home,
  Users,
  DollarSign,
  MessageSquare,
  Star,
  Trophy,
  BarChart2,
  Gift,
  Mic,
  UserCheck,
  Image,
  MessageCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaArrowRightFromBracket } from "react-icons/fa6";

// Sidebar menu items
const menuItems = [
  { label: "Charge System", icon: Star },
  { label: "Admin Massege", icon: MessageCircle },
  { label: "Banner", icon: Image },
  { label: "Coin Price", icon: Trophy },
  // { label: "Merchants", icon: UserCheck },
  { label: "Merchants", icon: BarChart2 },
  { label: "MerchantsCoins", icon: BarChart2 },
  { label: "Lucky Box", icon: Gift },
  { label: "Room", icon: Mic },
  { label: "Agency System", icon: UserCheck },
  { label: "Posts", icon: Image },
  { label: "Group Chat", icon: MessageCircle },
  { label: "App Settings", icon: Settings },
];

export default function Sidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token"); // ✅ clear the token
    navigate("/"); // Redirect to login
    window.location.reload(); // ✅ force auth state reset if not using context
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden  gap-1 text-white  items-center px-4 py-4 shadow w-full h-16 bg-[#121212] flex justify-between fixed top-0 left-0 z-50 mb-4">
        <span className="text-xl font-semibold">Black Stone</span>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)}>
          {isMobileOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1a1a1a] z-40 transform transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block text-white overflow-y-auto`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#333] flex justify-between items-center">
          <span className="text-xl font-bold">Black Stone </span>
          <button onClick={() => setIsMobileOpen(false)} className="md:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <ul className="space-y-2 p-4">
          {/* Dashboard */}
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded hover:bg-[#333] ${
                isActive ? "bg-[#333]" : ""
              }`
            }
          >
            <Home className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>

          {/* Users */}
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded hover:bg-[#333] ${
                isActive ? "bg-[#333]" : ""
              }`
            }
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </NavLink>

          {/* Withdraw Dropdown */}
          <li>
            <button
              onClick={() => setWithdrawOpen(!withdrawOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded hover:bg-[#333]"
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5" />
                <span>Withdraws</span>
              </div>
              {withdrawOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {withdrawOpen && (
              <ul className="ml-6 mt-1 space-y-1 text-sm">
                <NavLink
                  to="/withdraws/requests"
                  className="block px-2 py-1 rounded hover:bg-[#333]"
                >
                  Requests
                </NavLink>
                <NavLink
                  to="/Approve-withdraw"
                  className="block px-2 py-1 rounded hover:bg-[#333]"
                >
                  Approve Withdraw
                </NavLink>
                <NavLink
                  to="/withdraws/history"
                  className="block px-2 py-1 rounded hover:bg-[#333]"
                >
                  History
                </NavLink>
              </ul>
            )}
          </li>

          {/* Feedback */}
          <NavLink
            to="/feedback"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded hover:bg-[#333] ${
                isActive ? "bg-[#333]" : ""
              }`
            }
          >
            <MessageSquare className="w-5 h-5" />
            <span>Feedback</span>
          </NavLink>

          {/* Dynamic Menu Items */}
          {menuItems.map(({ label, icon: Icon }, idx) => (
            <NavLink
              key={idx}
              to={`/${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded hover:bg-[#333] ${
                  isActive ? "bg-[#333]" : ""
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}

          {/* Logout */}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-red-400 hover:text-red-500 hover:bg-[#333]"
            >
              <FaArrowRightFromBracket className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </>
  );
}
