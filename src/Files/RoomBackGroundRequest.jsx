import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomBackGroundRequest = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all requests
  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        "https://www.blackstonevoicechatroom.online/api/v2/admi/get/all/background/change/apply"
      );
      const all = res.data?.reverse() || [];
      setRequests(all);
      setFiltered(all);
    } catch (error) {
      console.error("Failed to fetch background requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter logic
  const handleSearch = (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term);

    if (!term) return setFiltered(requests);

    const result = requests.filter((req) =>
      req.RoomId?.toString().includes(term) ||
      req.ui_id?.toString().includes(term)
    );

    setFiltered(result);
  };

  // Approve or reject
  const handleAction = async (requestId, action) => {
    const confirmMsg = `Are you sure you want to ${action.toUpperCase()} this request?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setActionLoading(requestId + "-" + action);
      const res = await axios.post(
        "https://www.blackstonevoicechatroom.online/api/v2/admin/change/status/background",
        {
          requestId,
          action,
        }
      );

      alert(res.data.message);
      fetchRequests();
    } catch (error) {
      alert(
        error?.response?.data?.error || "Failed to perform action, please try again."
      );
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Background Change Requests</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by Room ID or UI_ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Requests List */}
      {loading ? (
        <p className="text-gray-600">Loading requests...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No requests found.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div
              key={req._id}
              className="bg-white p-4 rounded shadow border space-y-2"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p><strong>Room ID:</strong> {req.RoomId}</p>
                  <p><strong>UI_ID:</strong> {req.ui_id}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-1 font-semibold ${req.status === 'approved' ? 'text-green-600' : req.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {req.status}
                    </span>
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex gap-2">
                  <button
                    onClick={() => handleAction(req._id, "approve")}
                    disabled={actionLoading === req._id + "-approve"}
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading === req._id + "-approve" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleAction(req._id, "reject")}
                    disabled={actionLoading === req._id + "-reject"}
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading === req._id + "-reject" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>

              {req.backgroundImage && (
                <img
                  src={req.backgroundImage}
                  alt="Requested Background"
                  className="mt-2 w-full max-w-xs rounded border"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomBackGroundRequest;
