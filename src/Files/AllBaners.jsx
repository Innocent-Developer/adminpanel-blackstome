import React, { useEffect, useState } from "react";
import Sidebar from "../Compontents/Sidebar"; // ✅ Sidebar included

const AllBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://www.blackstonevoicechatroom.online/client/get/banner");
      const data = await res.json();
      setBanners(data.allBanner || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return (
    <div className="flex bg-[#121212] min-h-screen text-white">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">All Banners</h1>
          <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-1 px-3 rounded">
            Upload
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400">Loading banners...</p>
        ) : (
          <div className="overflow-x-auto border border-gray-700 rounded-lg">
            <table className="min-w-full text-sm text-center">
              <thead className="bg-[#1f1f1f] text-gray-300">
                <tr>
                  <th className="p-2 border border-gray-700">#</th>
                  <th className="p-2 border border-gray-700">Image</th>
                  <th className="p-2 border border-gray-700">URL</th>
                  <th className="p-2 border border-gray-700">Status</th>
                  <th className="p-2 border border-gray-700">Expiry</th>
                  <th className="p-2 border border-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((banner, index) => (
                  <tr key={banner._id} className="hover:bg-[#2a2a2a] transition">
                    <td className="p-2 border border-gray-700">{index + 1}</td>
                    <td className="p-2 border border-gray-700">
                      <img
                        src={banner.image}
                        alt="banner"
                        className="h-10 w-20 object-cover mx-auto rounded"
                      />
                    </td>
                    <td className="p-2 border border-gray-700 break-words max-w-[200px]">
                      <a
                        href={banner.url}
                        className="text-blue-400 underline break-all"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {banner.url}
                      </a>
                    </td>
                    <td className="p-2 border border-gray-700">
                      {banner.status === "active" ? (
                        <span className="bg-green-600 px-2 py-1 rounded text-white text-xs">Active</span>
                      ) : (
                        <span className="bg-red-600 px-2 py-1 rounded text-white text-xs">Inactive</span>
                      )}
                    </td>
                    <td className="p-2 border border-gray-700">
                      {Math.ceil((new Date(banner.expiry) - new Date()) / (1000 * 60 * 60 * 24))} Days
                    </td>
                    <td className="p-2 border border-gray-700 text-sm">
                      {new Date(banner.createdAt).toLocaleTimeString()}{" "}
                      {new Date(banner.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBanners;
