import { useEffect, useState } from "react";
import Sidebar from "../Compontents/Sidebar";
import { FaUsers, FaCoins, FaGem, FaBuilding } from "react-icons/fa";
import { Menu, X } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    gold: 0,
    diamond: 0,
    agency: 0,
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://www.blackstonevoicechatroom.online/a/admin/bsvcr/get/all/users"
        );
        const data = await res.json();

        const totalUsers = data.length;
        const gold = data.reduce((sum, user) => sum + (user.gold || 0), 0);
        const diamond = data.reduce((sum, user) => sum + (user.diamond || 0), 0);
        const agency = data.filter((user) => user.isAgency === true).length;

        setStats({ totalUsers, gold, diamond, agency });
      } catch (error) {
        console.error("Failed to fetch user data", error);
      }
    }

    fetchData();
  }, []);

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: <FaUsers size={24} />, color: "bg-[#1f1f1f]" },
    { label: "Gold", value: stats.gold, icon: <FaCoins size={24} className="text-yellow-400" />, color: "bg-[#1f1f1f]" },
    { label: "Diamond", value: stats.diamond, icon: <FaGem size={24} className="text-blue-400" />, color: "bg-[#1f1f1f]" },
    { label: "Agencies", value: stats.agency, icon: <FaBuilding size={24} />, color: "bg-[#1f1f1f]" },
  ];

  return (
    <div className="flex min-h-screen bg-[#121212] text-white relative">
      {/* Sidebar - responsive toggle */}
      <div className="md:hidden absolute top-0 left-0 w-full z-50 bg-[#1a1a1a] flex items-center justify-between px-4 py-3">
        <h2 className="text-lg font-bold">King Maker</h2>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar content */}
      <div className={`z-40 md:static ${sidebarOpen ? "block fixed top-12 left-0" : "hidden"} md:block`}>
        <Sidebar />
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 mt-14 md:mt-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <div className="rounded-full h-10 w-10 bg-gray-500"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, idx) => (
            <div key={idx} className={`p-4 rounded-lg shadow flex items-center gap-4 ${card.color}`}>
              <div className="p-2 bg-gray-800 rounded-full">{card.icon}</div>
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <h2 className="text-2xl font-bold">{card.value}</h2>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
