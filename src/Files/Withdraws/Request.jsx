import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

export default function WithdrawsRequest() {
  const [withdraws, setWithdraws] = useState([]);
  const [summary, setSummary] = useState({
    PendingWithDraws: 0,
    approvedWithdraws: 0,
    rejectedWithdraws: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchWithdraws() {
      try {
        const res = await fetch("https://www.blackstonevoicechatroom.online/admin/get/all/withdraws");
        const data = await res.json();
        setWithdraws(data.withdraws || []);
        setSummary({
          PendingWithDraws: data.PendingWithDraws || 0,
          approvedWithdraws: data.approvedWithdraws || 0,
          rejectedWithdraws: data.rejectedWithdraws || 0,
        });
      } catch (error) {
        console.error("Failed to fetch withdraws:", error);
      }
    }

    fetchWithdraws();
  }, []);

  const filteredWithdraws = withdraws.filter((w) =>
    (w.accountName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.accountNumber || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.bankName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.amount || "").toString().includes(searchTerm)
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#121212] text-white">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-semibold">Withdraw Requests</h1>
          <input
            type="text"
            placeholder="Search by name, bank, account, amount"
            className="bg-[#1f1f1f] text-white px-4 py-2 rounded-md w-full sm:w-80 border border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700 text-center">
            <h2 className="text-lg font-medium">Pending</h2>
            <p className="text-yellow-400 text-xl">{summary.PendingWithDraws}</p>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700 text-center">
            <h2 className="text-lg font-medium">Approved</h2>
            <p className="text-green-400 text-xl">{summary.approvedWithdraws}</p>
          </div>
          <div className="bg-[#1f1f1f] p-4 rounded-lg border border-gray-700 text-center">
            <h2 className="text-lg font-medium">Rejected</h2>
            <p className="text-red-400 text-xl">{summary.rejectedWithdraws}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-gray-800 rounded-lg">
          <table className="min-w-full table-auto text-sm">
            <thead className="bg-[#1f1f1f] text-gray-400 uppercase">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Account Name</th>
                <th className="px-4 py-3 text-left">Bank</th>
                <th className="px-4 py-3 text-left">Account No.</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdraws.map((withdraw, index) => (
                <tr key={withdraw._id} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2">{withdraw.ui_id || "N/A"}</td>
                  <td className="px-4 py-2">{withdraw.accountName || "N/A"}</td>
                  <td className="px-4 py-2">{withdraw.bankName || "N/A"}</td>
                  <td className="px-4 py-2">{withdraw.accountNumber || "N/A"}</td>
                  <td className="px-4 py-2 text-green-400">${withdraw.amount}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        withdraw.status === "pending"
                          ? "bg-yellow-600"
                          : withdraw.status === "approved"
                          ? "bg-green-600"
                          : "bg-red-600"
                      }`}
                    >
                      {withdraw.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {withdraw.request_date
                      ? new Date(withdraw.request_date).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
              {filteredWithdraws.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-400">
                    No withdraws found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
