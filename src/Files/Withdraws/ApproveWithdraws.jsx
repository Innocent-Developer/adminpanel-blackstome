import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function WithdrawApproval() {
  const [withdraws, setWithdraws] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWithdraws = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://www.blackstonevoicechatroom.online/admin/get/all/withdraws");
      const data = await res.json();
      setWithdraws(data.withdraws || []);
    } catch (err) {
      console.error("Failed to fetch withdrawals:", err);
    }
    setLoading(false);
  };

  const handleApprove = async (withdrawalId) => {
    if (!window.confirm("Are you sure you want to approve this withdrawal?")) return;

    try {
      const res = await fetch("https://www.blackstonevoicechatroom.online/admin/approve/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({id: withdrawalId}),
      });

      const result = await res.json();

      if (res.ok) {
        alert("Withdrawal approved successfully.");
        fetchWithdraws(); // Refresh the list
      } else {
        alert(result.message || "Failed to approve withdrawal.");
      }
    } catch (err) {
      console.error("Approval error:", err);
      alert("Error approving withdrawal.");
    }
  };

  useEffect(() => {
    fetchWithdraws();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#121212] text-white">
      <Sidebar />
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">Withdrawal Requests</h1>

        {loading ? (
          <div className="text-center py-10">Loading...</div>
        ) : (
          <div className="overflow-auto rounded-lg border border-gray-800">
            <table className="min-w-full table-auto">
              <thead className="bg-[#1f1f1f] text-sm text-gray-400 uppercase">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">User ID</th>
                  <th className="px-4 py-3 text-left">Amount (PKR)</th>
                  <th className="px-4 py-3 text-left">Account Name</th>
                  <th className="px-4 py-3 text-left">Account Number</th>
                  <th className="px-4 py-3 text-left">Bank</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Requested On</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {withdraws.map((item, index) => (
                  <tr
                    key={item._id}
                    className="border-b border-gray-700 hover:bg-[#2a2a2a]"
                  >
                    <td className="px-4 py-2">{index + 1}</td>
                    <td className="px-4 py-2">{item.ui_id}</td>
                    <td className="px-4 py-2">{item.amount}</td>
                    <td className="px-4 py-2">{item.accountName}</td>
                    <td className="px-4 py-2">{item.accountNumber}</td>
                    <td className="px-4 py-2">{item.bankName}</td>
                    <td className="px-4 py-2 capitalize">{item.status}</td>
                    <td className="px-4 py-2">
                      {new Date(item.request_date).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {item.status === "pending" ? (
                        <button
                          onClick={() => handleApprove(item._id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-md"
                        >
                          Approve
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">No action</span>
                      )}
                    </td>
                  </tr>
                ))}
                {withdraws.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-6 text-gray-400">
                      No withdrawals found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
