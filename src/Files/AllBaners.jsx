import React, { useEffect, useState } from "react";
import { Menu, Trash2 } from "lucide-react"; // Added Trash2 icon for delete button

const AllBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newBanner, setNewBanner] = useState({ image: "", url: "", expiry: "" });
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // Track which banner is being deleted

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

      const formData = new FormData();
      formData.append("file", newBanner.image);
      formData.append("upload_preset", "blackstome");

      const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dha65z0gy/image/upload", {
        method: "POST",
        body: formData,
      });

      const cloudData = await cloudRes.json();
      if (!cloudData.secure_url) throw new Error("Cloudinary upload failed.");

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

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await fetch(`https://www.blackstonevoicechatroom.online/admin/delete/banner/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();
      if (response.ok) {
        alert("Banner deleted successfully.");
        fetchBanners(); // Refresh the list
      } else {
        alert(result.message || "Failed to delete banner.");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Delete failed: " + error.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredBanners = banners.filter((banner) => {
    const matchesStatus =
      filterStatus === "all" ? true : banner.status === filterStatus;
    const matchesSearch = banner.url.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#121212] text-white relative">

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          {/* Toggle Button (Mobile only) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-white focus:outline-none"
          >
            <Menu size={28} />
          </button>
          <h1 className="text-2xl font-semibold">All Banners</h1>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Search by URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 rounded bg-[#1f1f1f] border border-gray-700 text-white text-sm"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 rounded bg-[#1f1f1f] border border-gray-700 text-white text-sm"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded text-sm"
            onClick={() => setShowModal(true)}
          >
            Upload
          </button>
        </div>

        {/* Table */}
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
                <th className="p-2 border border-gray-700">Actions</th> {/* Added Actions column */}
              </tr>
            </thead>
            <tbody>
              {filteredBanners.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-4 text-gray-400">
                    No banners found.
                  </td>
                </tr>
              ) : (
                filteredBanners.map((banner, index) => (
                  <tr key={banner._id} className="hover:bg-[#2a2a2a] transition">
                    <td className="p-2 border border-gray-700">{index + 1}</td>
                    <td className="p-2 border border-gray-700">
                      <img
                        src={banner.image}
                        alt="banner"
                        className="h-10 w-20 object-cover mx-auto rounded"
                      />
                    </td>
                    <td className="p-2 border border-gray-700 break-all max-w-[200px]">
                      <a
                        href={banner.url}
                        className="text-blue-400 underline"
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
                    <td className="p-2 border border-gray-700">
                      <button
                        onClick={() => handleDelete(banner._id)}
                        disabled={deletingId === banner._id}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded flex items-center justify-center mx-auto"
                        title="Delete banner"
                      >
                        {deletingId === banner._id ? (
                          "Deleting..."
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Upload */}
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
                  {uploading ? "Uploading..." : "Upload"}
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
