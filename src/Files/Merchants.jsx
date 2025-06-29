import React, { useEffect, useState } from "react";
import axios from "axios";

const AllMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [filteredMerchants, setFilteredMerchants] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const merchantsPerPage = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  const [formData, setFormData] = useState({
    merchantName: "",
    merchantAddress: "",
    merchantPhoneNumber: "",
    merchantEmail: "",
    merchantLogoUrl: "",
  });

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res = await axios.get("https://www.blackstonevoicechatroom.online/get/all/a/vvpi/merchants");
      const merchantList = res.data?.merchants || [];
      setMerchants(merchantList);
      setFilteredMerchants(merchantList);
    } catch (error) {
      console.error("Error fetching merchants:", error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
    if (e.target.value === "") setFilteredMerchants(merchants);
  };

  const searchMerchantById = async () => {
    if (!searchId.trim()) {
      setFilteredMerchants(merchants);
      return;
    }
    try {
      const res = await axios.get(`https://www.blackstonevoicechatroom.online/get/merchant/user/o/bsvcr/user/find/${searchId}`);
      setFilteredMerchants([res.data]);
      setCurrentPage(1);
    } catch (error) {
      console.error("Merchant not found.");
      setFilteredMerchants([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateMerchant = async () => {
    try {
      await axios.post("https://www.blackstonevoicechatroom.online/apply-merchant", formData);
      alert("Merchant created successfully!");
      setFormData({
        merchantName: "",
        merchantAddress: "",
        merchantPhoneNumber: "",
        merchantEmail: "",
        merchantLogoUrl: "",
      });
      setShowAddModal(false);
      fetchMerchants();
    } catch (error) {
      alert(error.response?.data?.message || "Error creating merchant");
    }
  };

  const handleApproveMerchant = async (ui_id) => {
    try {
      await axios.post("https://www.blackstonevoicechatroom.online/admin/approve/merchant", {
        merchantId: ui_id,
      });
      alert("Merchant approved!");
      fetchMerchants();
    } catch (error) {
      alert(error.response?.data?.message || "Approval failed");
    }
  };

  const handleExportCSV = () => {
    const headers = ["UI_ID", "Name", "Email", "Phone", "Address", "Status"];
    const rows = filteredMerchants.map((m) =>
      [m.ui_id, m.merchantName, m.merchantEmail, m.merchantPhoneNumber, m.merchantAddress, m.status].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "merchants.csv";
    link.click();
  };

  const openDetailModal = (merchant) => {
    setSelectedMerchant(merchant);
    setShowDetailModal(true);
  };

  const indexOfLast = currentPage * merchantsPerPage;
  const indexOfFirst = indexOfLast - merchantsPerPage;
  const currentMerchants = Array.isArray(filteredMerchants)
    ? filteredMerchants.slice(indexOfFirst, indexOfLast)
    : [];

  const totalPages = Math.ceil(filteredMerchants.length / merchantsPerPage);

  return (
    <div className="p-6 text-white bg-[#121212] min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-orange-400">All Merchants</h1>

      {/* Search */}
      <div className="flex flex-wrap gap-2 mb-6">
        <input
          type="text"
          value={searchId}
          onChange={handleSearchChange}
          placeholder="Search by UI_ID"
          className="px-4 py-2 bg-gray-800 text-white rounded w-60"
        />
        <button
          onClick={searchMerchantById}
          className="bg-orange-400 hover:bg-orange-600 px-4 py-2 rounded text-sm"
        >
          Search
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-sm"
        >
          + Add Merchant
        </button>
        <button
          onClick={handleExportCSV}
          className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm"
        >
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">UI_ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900">
            {currentMerchants.length > 0 ? (
              currentMerchants.map((merchant, idx) => (
                <tr
                  key={merchant._id}
                  className="border-b border-gray-800 hover:bg-gray-800"
                >
                  <td className="p-3">{indexOfFirst + idx + 1}</td>
                  <td className="p-3">{merchant.merchantName}</td>
                  <td className="p-3">{merchant.ui_id}</td>
                  <td className="p-3">{merchant.merchantEmail || "-"}</td>
                  <td className="p-3 text-green-400">{merchant.status || "Pending"}</td>
                  <td className="p-3 flex flex-wrap gap-2">
                    {merchant.status === "pending" && (
                      <button
                        onClick={() => handleApproveMerchant(merchant.ui_id)}
                        className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-xs"
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => openDetailModal(merchant)}
                      className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-3 text-center text-red-400">
                  No merchants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 flex-wrap gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 mx-1 rounded ${
                currentPage === i + 1 ? "bg-orange-500" : "bg-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add Merchant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#121212] bg-opacity-80">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4 text-white">Create New Merchant</h2>
            <div className="grid grid-cols-1 gap-4">
              {["merchantName", "merchantAddress", "merchantPhoneNumber", "merchantEmail", "merchantLogoUrl"].map(
                (field) => (
                  <input
                    key={field}
                    name={field}
                    value={formData[field]}
                    onChange={handleInputChange}
                    placeholder={field.replace("merchant", "").replace(/([A-Z])/g, " $1")}
                    className="px-3 py-2 rounded bg-gray-800 text-white w-full"
                  />
                )
              )}
            </div>
            <div className="flex justify-end mt-4 gap-2">
              <button onClick={() => setShowAddModal(false)} className="bg-gray-600 px-4 py-2 rounded">
                Cancel
              </button>
              <button onClick={handleCreateMerchant} className="bg-green-600 px-4 py-2 rounded">
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Detail Modal */}
      {showDetailModal && selectedMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-gray-900 text-white p-6 rounded-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Merchant Details</h2>
            <ul className="space-y-2">
              <li><strong>Name:</strong> {selectedMerchant.merchantName}</li>
              <li><strong>UI ID:</strong> {selectedMerchant.ui_id}</li>
              <li><strong>Email:</strong> {selectedMerchant.merchantEmail}</li>
              <li><strong>Phone:</strong> {selectedMerchant.merchantPhoneNumber}</li>
              <li><strong>Address:</strong> {selectedMerchant.merchantAddress}</li>
              <li><strong>Status:</strong> {selectedMerchant.status}</li>
            </ul>
            <div className="text-right mt-4">
              <button onClick={() => setShowDetailModal(false)} className="bg-red-600 px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllMerchants;

