import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";

const dummyData = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  uid: `UID${1000 + i}`,
  agency: i % 2 === 0 ? "Agency X" : "-",
  whatsapp: "-",
  status: i % 3 === 0 ? "Accepted" : "Pending",
  date: "24/02/2025",
}));

const ITEMS_PER_PAGE = 10;

const AgencyRequest = () => {
  const [data, setData] = useState(dummyData);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  const filteredData = data.filter((item) =>
    `${item.name} ${item.uid}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);

  const handleApprove = (id) => {
    setData((prev) =>
      prev.map((user) =>
        user.id === id ? { ...user, status: "Accepted" } : user
      )
    );
  };

  return (
    <div className="p-4 md:p-8 text-white bg-[#0f0f0f] min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-orange-400">Agency Request</h2>

      <div className="flex items-center bg-[#1c1c1c] px-4 py-2 rounded mb-4 w-full md:w-1/2">
        <FaSearch className="text-gray-400 mr-2" />
        <input
          type="text"
          placeholder="Search user by id, name..."
          className="bg-transparent outline-none text-white w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-auto rounded shadow bg-[#1a1a1a]">
        <table className="w-full table-auto text-sm">
          <thead className="bg-[#141414] text-orange-400">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">UID</th>
              <th className="px-4 py-2 text-left">Agency</th>
              <th className="px-4 py-2 text-left">WhatsApp</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Date</th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((user) => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-[#222]">
                <td className="px-4 py-2">{user.name}</td>
                <td className="px-4 py-2">{user.uid}</td>
                <td className="px-4 py-2">{user.agency}</td>
                <td className="px-4 py-2">{user.whatsapp}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === "Accepted"
                        ? "bg-green-700 text-white"
                        : "bg-yellow-700 text-white"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-2">{user.date}</td>
                <td className="px-4 py-2">
                  {user.status === "Pending" ? (
                    <button
                      className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 rounded"
                      onClick={() => handleApprove(user.id)}
                    >
                      Approve
                    </button>
                  ) : (
                    <span className="text-green-400 text-sm">✔</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {paginatedData.length === 0 && (
          <div className="text-center py-4 text-gray-400">No records found</div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-center items-center gap-2">
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>
        <span className="text-white">
          Page {page} of {totalPages}
        </span>
        <button
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded disabled:opacity-50"
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AgencyRequest;
