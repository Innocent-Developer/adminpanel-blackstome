import React, { useEffect, useState } from "react";
import Sidebar from "../Compontents/Sidebar";

const AllBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newBanner, setNewBanner] = useState({ image: "", url: "", expiry: "" });

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewBanner({ ...newBanner, image: file });
  };

  const handleUpload = async () => {
    if (!newBanner.image || !newBanner.url || !newBanner.expiry) {
      alert("All fields are required.");
      return;
    }

    try {
      setUploading(true);

      // Step 1: Upload image to Cloudinary
      const formData = new FormData();
      formData.append("file", newBanner.image);
      formData.append("upload_preset", "blackstome");

      const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dha65z0gy/image/upload", {
        method: "POST",
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error("Cloudinary upload failed.");

      // Step 2: Upload metadata to backend
      const response = await fetch("https://www.blackstonevoicechatroom.online/admin/add/banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: cloudData.secure_url,
          url: newBanner.url,
          status: "active",
          expiry: newBanner.expiry,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Banner uploaded successfully.");
        setShowModal(false);
        setNewBanner({ image: "", url: "", expiry: "" });
        fetchBanners();
      } else {
        alert(result.message || "Failed to upload.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex bg-[#121212] min-h-screen text-white">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 className="text-2xl font-semibold">All Banners</h1>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-1 px-4 rounded"
            onClick={() => setShowModal(true)}
          >
            Upload
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="ml-3 text-white">Loading banners...</span>
          </div>
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1f1f1f] p-6 rounded-lg w-[90%] max-w-md border border-gray-700">
              <h2 className="text-xl font-semibold mb-4 text-white">Add New Banner</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mb-3 w-full p-2 bg-[#121212] text-white border border-gray-700 rounded"
              />
              <input
                type="text"
                placeholder="Enter URL"
                value={newBanner.url}
                onChange={(e) => setNewBanner({ ...newBanner, url: e.target.value })}
                className="mb-3 w-full p-2 bg-[#121212] text-white border border-gray-700 rounded"
              />
              <input
                type="date"
                value={newBanner.expiry}
                onChange={(e) => setNewBanner({ ...newBanner, expiry: e.target.value })}
                className="mb-4 w-full p-2 bg-[#121212] text-white border border-gray-700 rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                  onClick={() => setShowModal(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded flex items-center justify-center"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllBanners;
