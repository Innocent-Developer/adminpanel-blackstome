import React, { useEffect, useState } from "react";
import axios from "axios";

const AgencyManager = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const ui_id = user?.ui_id;

  const [agencies, setAgencies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    agencyName: "",
    agencyLogo: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch all agencies
  const fetchAgencies = async () => {
    setFetching(true);
    try {
      const res = await axios.get(
        "https://www.blackstonevoicechatroom.online/api/v1/get/all/agency" // Changed to HTTPS
      );
      setAgencies(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch agencies:", err);
      setAgencies([]);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, []);

  // Upload image to Cloudinary
  const handleUploadLogo = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blackstome");

    setLoading(true);
    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dha65z0gy/image/upload",
        formData
      );
      setForm((prev) => ({ ...prev, agencyLogo: res.data.secure_url }));
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  // Create agency
  const handleCreateAgency = async () => {
    if (!form.agencyName || !form.agencyLogo || !ui_id || !user?.name) {
      return alert("All fields are required.");
    }

    const submission = {
      agencyName: form.agencyName,
      agencyLogo: form.agencyLogo,
      name: user.name,
      ui_id: ui_id,
    };

    console.log("Submitting agency:", submission); // Debug log

    try {
      const res = await axios.post(
        "https://www.blackstonevoicechatroom.online/api/v1/agency/create", // Changed to HTTPS
        submission
      );
      alert("Agency created successfully.");
      setShowModal(false);
      setForm({ agencyName: "", agencyLogo: "" });
      fetchAgencies();
    } catch (err) {
      console.error("Agency creation failed:", err);
      if (err.response) {
        console.error("Backend response:", err.response.data);
        alert(err.response.data.message || "Agency creation failed.");
      } else {
        alert("Server is not responding.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 relative mt-6">
      {/* Loader */}
      {fetching && (
        <div className="absolute inset-0 bg-[#121212] bg-opacity-90 z-50 flex justify-center items-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">All Agencies</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-600 px-4 py-2 rounded hover:bg-orange-700"
        >
          + Create Agency
        </button>
      </div>

      {/* Agency Grid */}
      {Array.isArray(agencies) && agencies.length === 0 && !fetching ? (
        <p className="text-gray-400">No agencies found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agencies.map((agency) => (
            <div
              key={agency._id}
              className="bg-[#1f1f1f] p-4 rounded-lg shadow hover:shadow-lg transition"
            >
              <img
                src={agency.agencyLogo}
                alt="Logo"
                className="h-20 w-20 rounded-full object-cover mb-3"
              />
              <h3 className="text-lg font-bold">{agency.agencyName}</h3>
              <p className="text-sm text-gray-400">
                ID : {agency.agencyId || "Unknown"}
              </p>
              <p className="text-sm text-gray-400">
                Creator: {agency.name || "Unknown"}
              </p>
              <p className="text-sm text-gray-400">
                Creator ID: {agency.createrId || "Unknown"}
                </p>
            </div>
          ))}
        </div>
      )}

      {/* Create Agency Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
          <div className="bg-[#1c1c1c] p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-orange-400 mb-4">
              Create New Agency
            </h2>

            <input
              type="text"
              placeholder="Agency Name"
              value={form.agencyName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, agencyName: e.target.value }))
              }
              className="w-full p-2 mb-3 rounded bg-[#2a2a2a] text-white"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleUploadLogo}
              className="w-full p-2 mb-3 bg-[#2a2a2a] rounded text-white"
            />
            {loading && (
              <p className="text-sm text-gray-400 mb-2">Uploading...</p>
            )}
            {form.agencyLogo && (
              <img
                src={form.agencyLogo}
                alt="Preview"
                className="h-24 w-24 object-cover rounded mb-3"
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAgency}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded"
                disabled={loading}
              >
                {loading ? "Please wait..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyManager;