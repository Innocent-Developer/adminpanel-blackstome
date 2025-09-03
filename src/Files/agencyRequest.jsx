import React, { useEffect, useState } from "react";
import axios from "axios";

const AgencyManager = () => {
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const ui_id = user?.ui_id;

  const [agencies, setAgencies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [agencyToDelete, setAgencyToDelete] = useState(null);
  const [form, setForm] = useState({
    agencyName: "",
    agencyLogo: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // Fetch all agencies
  const fetchAgencies = async () => {
    setFetching(true);
    try {
      const res = await axios.get(
        "https://www.blackstonevoicechatroom.online/api/v1/get/all/agency"
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

    console.log("Submitting agency:", submission);

    try {
      const res = await axios.post(
        "https://www.blackstonevoicechatroom.online/api/v1/agency/create",
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

  // Delete agency
  const handleDeleteAgency = async () => {
    if (!agencyToDelete) return;
    
    setDeleting(true);
    try {
      const res = await axios.delete(
        `https://www.blackstonevoicechatroom.online/api/v1/agency/delete/${agencyToDelete._id}`
      );
      
      if (res.data.success) {
        alert("Agency deleted successfully.");
        setShowDeleteModal(false);
        setAgencyToDelete(null);
        fetchAgencies();
      } else {
        alert(res.data.message || "Failed to delete agency.");
      }
    } catch (err) {
      console.error("Agency deletion failed:", err);
      if (err.response) {
        alert(err.response.data.message || "Agency deletion failed.");
      } else {
        alert("Server is not responding.");
      }
    } finally {
      setDeleting(false);
    }
  };

  // Open delete confirmation modal
  const confirmDelete = (agency) => {
    setAgencyToDelete(agency);
    setShowDeleteModal(true);
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
              className="bg-[#1f1f1f] p-4 rounded-lg shadow hover:shadow-lg transition relative"
            >
              {/* Delete Button */}
              <button
                onClick={() => confirmDelete(agency)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full"
                title="Delete Agency"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              
              <img
                src={agency.agencyLogo}
                alt="Logo"
                className="h-20 w-20 rounded-full object-cover mb-3 mx-auto"
              />
              <h3 className="text-lg font-bold text-center">{agency.agencyName}</h3>
              <p className="text-sm text-gray-400">
                ID: {agency.agencyId || "Unknown"}
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
                className="h-24 w-24 object-cover rounded mb-3 mx-auto"
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && agencyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
          <div className="bg-[#1c1c1c] p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-red-400 mb-4">
              Confirm Delete
            </h2>
            
            <div className="flex items-center mb-4">
              <img
                src={agencyToDelete.agencyLogo}
                alt="Logo"
                className="h-16 w-16 rounded-full object-cover mr-4"
              />
              <div>
                <h3 className="text-lg font-bold">{agencyToDelete.agencyName}</h3>
                <p className="text-sm text-gray-400">ID: {agencyToDelete.agencyId}</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">
              Are you sure you want to delete this agency? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAgencyToDelete(null);
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAgency}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  "Delete Agency"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgencyManager;