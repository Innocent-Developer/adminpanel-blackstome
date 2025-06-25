import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phoneNumber: "",
    gold: 0,
    diamond: 0,
    isBlocked: false,
    avatarUrl: "",
    ui_id: "",
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("https://www.blackstonevoicechatroom.online/a/admin/bsvcr/get/all/users");
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(user =>
    (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.ui_id || "").toString().includes(searchTerm) ||
    (user.phoneNumber || "").toString().includes(searchTerm)
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToPage = (page) => setCurrentPage(page);

  const openEditModal = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      gold: user.gold || 0,
      diamond: user.diamond || 0,
      isBlocked: user.isBlocked || false,
      avatarUrl: user.avatarUrl || "",
      ui_id: user.ui_id || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      let avatarUrl = formData.avatarUrl;
      if (avatarFile) {
        const cloudFormData = new FormData();
        cloudFormData.append("file", avatarFile);
        cloudFormData.append("upload_preset", "blackstome");

        const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dha65z0gy/image/upload", {
          method: "POST",
          body: cloudFormData,
        });

        const cloudData = await cloudRes.json();
        if (!cloudData.secure_url) throw new Error("Cloudinary upload failed.");
        avatarUrl = cloudData.secure_url;
      }

      const response = await fetch("https://www.blackstonevoicechatroom.online/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editUser._id,
          updateData: {
            name: formData.name,
            phoneNumber: formData.phoneNumber,
            gold: formData.gold,
            diamond: formData.diamond,
            isBlocked: formData.isBlocked,
            avatarUrl: avatarUrl,
            ui_id: formData.ui_id,
          },
        }),
      });

      if (response.ok) {
        alert("User updated successfully");
        setShowEditModal(false);
        window.location.reload();
      } else {
        alert("Failed to update user");
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating user");
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const response = await fetch("https://www.blackstonevoicechatroom.online/user/account/delete/a/time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ui_id: uid }),
      });

      if (response.ok) {
        alert("User deleted successfully");
        window.location.reload();
      } else {
        alert("Failed to delete user");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting user");
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <input
          type="text"
          placeholder="Search by Name, Phone, UID"
          className="bg-[#1f1f1f] text-white px-4 py-2 rounded-md w-full sm:w-80 border border-gray-700"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="overflow-x-auto border border-gray-800 rounded-lg">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-[#1f1f1f] text-gray-400 uppercase">
            <tr>
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Avatar</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">UID</th>
              <th className="px-4 py-3 text-left">Gold</th>
              <th className="px-4 py-3 text-left">Diamond</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Phone</th>
              <th className="px-4 py-3 text-left">Blocked</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user, index) => (
              <tr key={user._id} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                <td className="px-4 py-2">{indexOfFirstUser + index + 1}</td>
                <td className="px-4 py-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : "N/A"}
                </td>
                <td className="px-4 py-2">{user.name || "N/A"}</td>
                <td className="px-4 py-2">{user.ui_id || "N/A"}</td>
                <td className="px-4 py-2">{user.gold || 0}</td>
                <td className="px-4 py-2">{user.diamond || 0}</td>
                <td className="px-4 py-2">{user.email || "N/A"}</td>
                <td className="px-4 py-2">{user.phoneNumber || "N/A"}</td>
                <td className="px-4 py-2 text-red-500">{user.isBlocked ? "true" : "false"}</td>
                <td className="px-4 py-2 flex flex-col sm:flex-row gap-2">
                  <button onClick={() => openEditModal(user)} className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteUser(user.ui_id)} className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {currentUsers.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <button
          onClick={goToPrevPage}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToPage(idx + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === idx + 1 ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
            }`}
          >
            {idx + 1}
          </button>
        ))}

        <button
          onClick={goToNextPage}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Edit Modal is unchanged */}
      {showEditModal && (
        /* ... keep your modal here (same as before) ... */
        <></> // Keep your existing modal implementation here
      )}
    </div>
  );
}
