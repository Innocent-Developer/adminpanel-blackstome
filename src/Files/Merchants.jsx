import React, { useEffect, useState } from "react";
import axios from "axios";

const AllMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [filteredMerchants, setFilteredMerchants] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const merchantsPerPage = 10;

  const [showCoinModal, setShowCoinModal] = useState(false);
  const [coinAmount, setCoinAmount] = useState("");
  const [coinTargetId, setCoinTargetId] = useState("");

  const [formData, setFormData] = useState({
    merchantName: "",
    merchantAddress: "",
    merchantPhoneNumber: "",
    merchantEmail: "",
    merchantLogoUrl: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res = await axios.get("https://www.blackstonevoicechatroom.online/get/all/a/vvpi/merchants");
      const list = res.data?.merchants || [];
      setMerchants(list);
      setFilteredMerchants(list);
    } catch (err) {
      alert("Failed to fetch merchants");
    }
  };

  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
    if (e.target.value === "") setFilteredMerchants(merchants);
  };

  const searchMerchantById = async () => {
    if (!searchId.trim()) return;
    try {
      const res = await axios.get(
        `https://www.blackstonevoicechatroom.online/get/merchant/user/o/bsvcr/user/find/${searchId}`
      );
      setFilteredMerchants([res.data]);
    } catch (err) {
      alert("Merchant not found");
      setFilteredMerchants([]);
    }
  };

  const handleCreateMerchant = async () => {
    try {
      await axios.post("https://www.blackstonevoicechatroom.online/apply-merchant", formData);
      alert("Merchant created");
      setShowAddModal(false);
      fetchMerchants();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create merchant");
    }
  };

  const handleApprove = async (ui_id) => {
    try {
      await axios.post("https://www.blackstonevoicechatroom.online/admin/approve/merchant", {
        merchantId: ui_id,
      });
      alert("Merchant approved");
      fetchMerchants();
    } catch (err) {
      alert(err.response?.data?.message || "Approval failed");
    }
  };

  const handleAddCoins = async () => {
    try {
      await axios.post("https://www.blackstonevoicechatroom.online/admin/merchant/coin/add/fast", {
        ui_id: coinTargetId,
        amount: Number(coinAmount),
      });
      alert("Coins added");
      setShowCoinModal(false);
      fetchMerchants();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add coins");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Name", "UI_ID", "Email", "Coins", "Status"];
    const rows = filteredMerchants.map((m) =>
      [m.merchantName, m.ui_id, m.merchantEmail, m.coins || 0, m.status].join(",")
    );
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "merchants.csv";
    link.click();
  };

  const openCoinModal = (ui_id) => {
    setCoinTargetId(ui_id);
    setCoinAmount("");
    setShowCoinModal(true);
  };

  // Pagination
  const indexOfLast = currentPage * merchantsPerPage;
  const indexOfFirst = indexOfLast - merchantsPerPage;
  const currentMerchants = filteredMerchants.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMerchants.length / merchantsPerPage);

  return (
    <div className="p-6 bg-[#111] text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-orange-400">All Merchants</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          value={searchId}
          onChange={handleSearchChange}
          className="bg-gray-800 px-3 py-2 rounded"
          placeholder="Search by UI_ID"
        />
        <button onClick={searchMerchantById} className="bg-orange-500 px-4 py-2 rounded">
          Search
        </button>
        <button onClick={() => setShowAddModal(true)} className="bg-green-500 px-4 py-2 rounded">
          + Add Merchant
        </button>
        <button onClick={handleExportCSV} className="bg-blue-600 px-4 py-2 rounded">
          Export CSV
        </button>
      </div>

      <div className="overflow-auto border border-gray-700 rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">UI_ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Coins</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900">
            {currentMerchants.map((m, i) => (
              <tr key={m._id} className="border-b border-gray-800 hover:bg-gray-800">
                <td className="p-3">{indexOfFirst + i + 1}</td>
                <td className="p-3">{m.merchantName}</td>
                <td className="p-3">{m.ui_id}</td>
                <td className="p-3">{m.merchantEmail}</td>
                <td className="p-3">{m.coinBalance || 0}</td>
                <td className="p-3">{m.status}</td>
                <td className="p-3 space-x-2">
                  {m.status === "pending" && (
                    <button onClick={() => handleApprove(m.ui_id)} className="bg-blue-500 px-2 py-1 rounded text-xs">
                      Approve
                    </button>
                  )}
                  <button onClick={() => openCoinModal(m.ui_id)} className="bg-yellow-500 px-2 py-1 rounded text-xs">
                    Add Coins
                  </button>
                </td>
              </tr>
            ))}
            {currentMerchants.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-red-400">
                  No merchants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? "bg-orange-500" : "bg-gray-700"}`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Add Coin Modal */}
      {showCoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4 text-yellow-400 font-bold">Add Coins</h2>
            <input
              type="number"
              placeholder="Enter coin amount"
              value={coinAmount}
              onChange={(e) => setCoinAmount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 text-white rounded mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowCoinModal(false)} className="bg-gray-700 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleAddCoins} className="bg-yellow-500 px-4 py-2 rounded">
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Merchant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-96">
            <h2 className="text-xl mb-4 font-bold text-green-400">Add New Merchant</h2>
            <input
              className="w-full mb-2 px-3 py-2 rounded bg-gray-800"
              placeholder="Name"
              name="merchantName"
              value={formData.merchantName}
              onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
            />
            <input
              className="w-full mb-2 px-3 py-2 rounded bg-gray-800"
              placeholder="Email"
              name="merchantEmail"
              value={formData.merchantEmail}
              onChange={(e) => setFormData({ ...formData, merchantEmail: e.target.value })}
            />
            <input
              className="w-full mb-2 px-3 py-2 rounded bg-gray-800"
              placeholder="Phone"
              name="merchantPhoneNumber"
              value={formData.merchantPhoneNumber}
              onChange={(e) => setFormData({ ...formData, merchantPhoneNumber: e.target.value })}
            />
            <input
              className="w-full mb-2 px-3 py-2 rounded bg-gray-800"
              placeholder="Address"
              name="merchantAddress"
              value={formData.merchantAddress}
              onChange={(e) => setFormData({ ...formData, merchantAddress: e.target.value })}
            />
            <input
              className="w-full mb-4 px-3 py-2 rounded bg-gray-800"
              placeholder="Logo URL"
              name="merchantLogoUrl"
              value={formData.merchantLogoUrl}
              onChange={(e) => setFormData({ ...formData, merchantLogoUrl: e.target.value })}
            />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowAddModal(false)} className="bg-gray-700 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleCreateMerchant} className="bg-green-500 px-4 py-2 rounded">
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMerchants;
