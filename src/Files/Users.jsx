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
     titleTag: "", // new field
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

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
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
      titleTag: user.titleTag || "",
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
            avatarUrl,
            ui_id: formData.ui_id,
              titleTag: formData.titleTag, // new field
          },
        }),
      });

      if (response.ok) {
        alert("User updated successfully");
        setShowEditModal(false);
        window.location.reload(); // Or refresh user list manually
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
              <th className="px-4 py-3 text-left">Tital</th>
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
                <td className="px-4 py-2">{user.titleTag || "N/A"}</td>
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

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
        <button onClick={goToPrevPage} disabled={currentPage === 1} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50">
          Prev
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button key={idx} onClick={() => goToPage(idx + 1)} className={`px-3 py-1 rounded ${currentPage === idx + 1 ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}>
            {idx + 1}
          </button>
        ))}
        <button onClick={goToNextPage} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50">
          Next
        </button>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
  <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2c2c2c] rounded-2xl shadow-xl p-6 w-full max-w-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">✏️ Edit User Info</h2>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="👤 Name"
          className="input-glow"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="📞 Phone Number"
          className="input-glow"
          value={formData.phoneNumber}
          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
        />

        <input
          type="number"
          placeholder="🪙 Gold"
          className="input-glow"
          value={formData.gold}
          onChange={(e) => setFormData({ ...formData, gold: +e.target.value })}
        />

        <input
          type="number"
          placeholder="💎 Diamond"
          className="input-glow"
          value={formData.diamond}
          onChange={(e) => setFormData({ ...formData, diamond: +e.target.value })}
        />

        <div className="flex items-center text-white gap-2">
          <input
            type="checkbox"
            checked={formData.isBlocked}
            onChange={(e) => setFormData({ ...formData, isBlocked: e.target.checked })}
            className="accent-pink-600"
          />
          <label>🚫 Blocked</label>
        </div>

        <input
          type="text"
          placeholder="🔑 UID"
          className="input-glow"
          value={formData.ui_id}
          onChange={(e) => setFormData({ ...formData, ui_id: e.target.value })}
        />

        <select
          className="input-glow text-white"
          value={formData.titleTag}
          onChange={(e) => setFormData({ ...formData, titleTag: e.target.value })}
        >
          <option value="">🎖 Select Title Tag</option>
          <option value="App developer">App developer</option>
          <option value="App owner">App owner</option>
          <option value="Super admin">Super admin</option>
          <option value="Admin">Admin</option>
          <option value="BD">BD</option>
          <option value="Customer Service">Customer Service</option>
          <option value="Top 1 Recharge">Top 1 Recharge</option>
          <option value="Top 2 Recharge">Top 2 Recharge</option>
          <option value="Top 3 Recharge">Top 3 Recharge</option>
          <option value="CP Top 1">CP Top 1</option>
          <option value="CP Top 2">CP Top 2</option>
          <option value="Pak CS">Pak CS</option>
          <option value="OFFICIAL Team">OFFICIAL Team</option>
          <option value="Gredday King">Gredday King</option>
          <option value="Greeday Queen">Greeday Queen</option>
          <option value="Agency owner">Agency owner</option>
          <option value="Official host">Official host</option>
          <option value="Star host">Star host</option>
          <option value="Wealth Star">Wealth Star</option>
        </select>

        <input
          type="file"
          accept="image/*"
          className="input-glow text-white file:bg-gray-700 file:border-0 file:px-4 file:py-2 file:rounded file:text-sm"
          onChange={(e) => setAvatarFile(e.target.files[0])}
        />
      </div>

      <div className="flex justify-end mt-6 gap-4">
        <button
          onClick={() => setShowEditModal(false)}
          className="px-5 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateUser}
          className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition duration-200"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}




