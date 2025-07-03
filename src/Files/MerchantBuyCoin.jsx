import React, { useEffect, useState } from "react";
import axios from "axios";

const CoinRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://www.blackstonevoicechatroom.online/get/all/coin-requests"); // You must create this GET route
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch coin requests:", err);
    }
    setLoading(false);
  };

  const handleAction = async (requestId, action) => {
    try {
      const confirm = window.confirm(`Are you sure you want to ${action} this request?`);
      if (!confirm) return;

      await axios.post("http://www.blackstonevoicechatroom.online/admin/approve/coin", { requestId, action });
      alert(`Request ${action}ed successfully.`);
      fetchRequests();
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
      alert("An error occurred while processing the request.");
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 text-white bg-[#121212] min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-orange-500">Merchant Coin Requests</h2>

      {loading ? (
        <p className="text-gray-300">Loading...</p>
      ) : (
        <div className="overflow-x-auto border border-gray-700 rounded-lg">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-800 text-gray-300">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Merchant</th>
                <th className="p-3">Coins</th>
                <th className="p-3">Amount ($)</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Tx Hash</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="bg-gray-900">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-3 text-center text-gray-400">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map((r, i) => (
                  <tr key={r._id} className="border-b border-gray-800">
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3">{r.ui_id}</td>
                    <td className="p-3">{r.coinAmount}</td>
                    <td className="p-3">${r.payPrice}</td>
                    <td className="p-3">{r.paymentMethod}</td>
                    <td className="p-3 truncate max-w-xs">{r.transactionHash}</td>
                    <td className={`p-3 ${r.status === "approved" ? "text-green-400" : r.status === "rejected" ? "text-red-400" : "text-yellow-400"}`}>
                      {r.status}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => handleAction(r._id, "approve")}
                        disabled={r.status !== "pending"}
                        className="bg-green-600 px-3 py-1 text-xs rounded hover:bg-green-700 disabled:opacity-40"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(r._id, "reject")}
                        disabled={r.status !== "pending"}
                        className="bg-red-600 px-3 py-1 text-xs rounded hover:bg-red-700 disabled:opacity-40"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CoinRequests;
