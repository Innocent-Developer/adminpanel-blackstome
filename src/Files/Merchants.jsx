import React, { useEffect, useState } from "react";
import axios from "axios";

const AllMerchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [filteredMerchants, setFilteredMerchants] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const merchantsPerPage = 10;

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      const res = await axios.get("https://www.blackstonevoicechatroom.online/get/all/a/vvpi/merchants");
      setMerchants(res.data);
      setFilteredMerchants(res.data);
    } catch (error) {
      console.error("Error fetching merchants:", error);
    }
  };

  const searchMerchantById = async () => {
    if (!searchId.trim()) return setFilteredMerchants(merchants);

    try {
      const res = await axios.get(`https://www.blackstonevoicechatroom.online/get/merchant/user/o/bsvcr/user/find/${searchId}`);
      setFilteredMerchants([res.data]);
      setCurrentPage(1);
    } catch (error) {
      console.error("Merchant not found.");
      setFilteredMerchants([]);
    }
  };

  const handleSearchChange = (e) => {
    setSearchId(e.target.value);
    if (e.target.value === "") setFilteredMerchants(merchants);
  };

  // Pagination
  const indexOfLast = currentPage * merchantsPerPage;
  const indexOfFirst = indexOfLast - merchantsPerPage;
  const currentMerchants = filteredMerchants.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMerchants.length / merchantsPerPage);

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-orange-400">All Merchants</h1>

      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={searchId}
          onChange={handleSearchChange}
          placeholder="Search by UI_ID"
          className="px-4 py-2 bg-gray-800 text-white rounded w-60"
        />
        <button
          onClick={searchMerchantById}
          className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm"
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Name</th>
              <th className="p-3">UI_ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900">
            {currentMerchants.length > 0 ? (
              currentMerchants.map((merchant, idx) => (
                <tr key={merchant._id} className="border-b border-gray-800 hover:bg-gray-800">
                  <td className="p-3">{indexOfFirst + idx + 1}</td>
                  <td className="p-3">{merchant.name}</td>
                  <td className="p-3">{merchant.ui_id}</td>
                  <td className="p-3">{merchant.email || "-"}</td>
                  <td className="p-3 text-green-400">{merchant.status || "Active"}</td>
                  <td className="p-3">{new Date(merchant.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-3 text-center text-red-400">No merchants found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
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
    </div>
  );
};

export default AllMerchants;
