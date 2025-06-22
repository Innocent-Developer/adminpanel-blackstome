import { useEffect, useState } from "react";
import { FaUsers, FaCoins, FaGem, FaBuilding } from "react-icons/fa";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    gold: 0,
    diamond: 0,
    agency: 0,
  });

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
    <div className=" bg-[#121212] text-white p-6 mt-10">
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
    </div>
  );
}
