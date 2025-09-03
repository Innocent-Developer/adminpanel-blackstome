import React, { useEffect, useState } from "react";
import axios from "axios";

const AgencyManager = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const ui_id = user?.ui_id;

  const [agencies, setAgencies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [agencyDetails, setAgencyDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
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

  // Fetch agency details
  const fetchAgencyDetails = async (agencyId) => {
    setLoadingDetails(true);
    try {
      const res = await axios.get(
        "https://www.blackstonevoicechatroom.online/api/v1/agency/record",
        { 
          agencyId: Number(agencyId) ,
        }
      );
      setAgencyDetails(res.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Failed to fetch agency details:", err);
      alert("Failed to fetch agency details.");
    } finally {
      setLoadingDetails(false);
    }
  };

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
              
              {/* View Details Button */}
              <button
                onClick={() => fetchAgencyDetails(agency.agencyId)}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                disabled={loadingDetails}
              >
                {loadingDetails ? "Loading..." : "View Details"}
              </button>
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

      {/* Agency Details Modal */}
      {showDetailsModal && agencyDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
          <div className="bg-[#1c1c1c] p-6 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-400">
                Agency Details
              </h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setAgencyDetails(null);
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Agency Info */}
            <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg">
              <h3 className="text-lg font-semibold mb-3 text-orange-400">Agency Information</h3>
              <div className="flex items-start mb-4">
                <img
                  src={agencyDetails.agency.agencyLogo}
                  alt="Agency Logo"
                  className="h-16 w-16 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-medium">Name: {agencyDetails.agency.agencyName}</p>
                  <p className="text-sm text-gray-400">ID: {agencyDetails.agency.agencyId}</p>
                  <p className="text-sm text-gray-400">Created: {new Date(agencyDetails.agency.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Creator Info */}
            {agencyDetails.creator && (
              <div className="mb-6 p-4 bg-[#2a2a2a] rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-orange-400">Creator Information</h3>
                <p className="mb-1">Name: {agencyDetails.creator.name}</p>
                <p className="mb-1 text-sm text-gray-400">User ID: {agencyDetails.creator.ui_id}</p>
                <p className="text-sm text-gray-400">Email: {agencyDetails.creator.email}</p>
              </div>
            )}

            {/* Joined Users */}
            {agencyDetails.joinedUsers && agencyDetails.joinedUsers.length > 0 && (
              <div className="p-4 bg-[#2a2a2a] rounded-lg">
                <h3 className="text-lg font-semibold mb-3 text-orange-400">
                  Joined Users ({agencyDetails.joinedUsers.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {agencyDetails.joinedUsers.map((user) => (
                    <div key={user.ui_id} className="p-3 bg-[#1c1c1c] rounded">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-400">ID: {user.ui_id}</p>
                      <p className="text-sm text-gray-400">Email: {user.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {agencyDetails.joinedUsers && agencyDetails.joinedUsers.length === 0 && (
              <p className="text-gray-400 italic">No users have joined this agency yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyManager;