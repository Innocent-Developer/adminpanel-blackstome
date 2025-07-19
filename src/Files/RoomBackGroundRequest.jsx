import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomBackGroundRequest = () => {
  const [requests, setRequests] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    <div className="p-4 sm:p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-white mb-6">🎨 Background Change Requests</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Room ID or UI_ID..."
          value={searchTerm}
          onChange={handleSearch}
          className="w-full p-3 rounded-md bg-[#1f1f1f] border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Requests */}
      {loading ? (
        <p className="text-gray-400">Loading requests...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-500">No requests found.</p>
      ) : (
        <div className="grid gap-6">
          {filtered.map((req) => (
            <div
              key={req._id}
              className="bg-[#111827] text-white p-4 sm:p-6 rounded-xl border border-gray-700 shadow-md transition hover:shadow-lg"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <p><span className="font-semibold">Room ID:</span> {req.RoomId}</p>
                  <p><span className="font-semibold">UI_ID:</span> {req.ui_id}</p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    <span
                      className={`px-3 py-0.5 rounded-full text-sm font-medium
                      ${req.status === "approved"
                          ? "bg-green-700 text-green-100"
                          : req.status === "rejected"
                          ? "bg-red-700 text-red-100"
                          : "bg-yellow-600 text-yellow-100"}`}
                    >
                      {req.status}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleAction(req._id, "approve")}
                    disabled={actionLoading === req._id + "-approve"}
                    className="bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-md text-sm font-semibold text-white disabled:opacity-50 transition"
                  >
                    {actionLoading === req._id + "-approve" ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => handleAction(req._id, "reject")}
                    disabled={actionLoading === req._id + "-reject"}
                    className="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-md text-sm font-semibold text-white disabled:opacity-50 transition"
                  >
                    {actionLoading === req._id + "-reject" ? "Rejecting..." : "Reject"}
                  </button>
                </div>
              </div>

              {req.backgroundImage && (
                <div className="mt-4">
                  <img
                    src={req.backgroundImage}
                    alt="Requested Background"
                    className="w-full max-w-sm rounded-lg border border-gray-600 shadow-sm hover:shadow-lg transition"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomBackGroundRequest;
