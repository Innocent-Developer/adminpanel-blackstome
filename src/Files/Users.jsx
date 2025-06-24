import { useEffect, useState } from "react";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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

  const openEditModal = (user) => {
    setEditUser(user);
    setFormData({
      name: user.name || "",
      phoneNumber: user.phoneNumber || "",
      gold: user.gold || 0,
      diamond: user.diamond || 0,
      isBlocked: user.isBlocked || false,
      avatarUrl: user.avatarUrl || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateUser = async () => {
    try {
      let avatarUrl = formData.avatarUrl;

      // Upload to Cloudinary if avatarFile is selected
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

      // Send update request
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

  const filteredUsers = users.filter(user =>
    (user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.uid || "").toString().includes(searchTerm) ||
    (user.phoneNumber || "").toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 sm:p-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-semibold">Users</h1>
        <input
          type="text"
          placeholder="Search user by ID, name, phone"
          className="bg-[#1f1f1f] text-white px-4 py-2 rounded-md w-full sm:w-80 border border-gray-700"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredUsers.map((user, index) => (
              <tr key={user._id} className="border-b border-gray-700 hover:bg-[#2a2a2a]">
                <td className="px-4 py-2">{index + 1}</td>
                <td className="px-4 py-2">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    "N/A"
                  )}
                </td>
                <td className="px-4 py-2">{user.name || "N/A"}</td>
                <td className="px-4 py-2">{user.ui_id || "N/A"}</td>
                <td className="px-4 py-2">{user.gold || 0}</td>
                <td className="px-4 py-2">{user.diamond || 0}</td>
                <td className="px-4 py-2 max-w-[150px] truncate">{user.email || "N/A"}</td>
                <td className="px-4 py-2">{user.phoneNumber || "N/A"}</td>
                <td className="px-4 py-2 text-red-500">{user.isBlocked ? "true" : "false"}</td>
                <td className="px-4 py-2 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => openEditModal(user)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.ui_id)}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center py-4 text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1f1f1f] p-6 rounded-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold mb-2">Edit User</h2>

            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-[#2a2a2a] text-white"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <input
              type="text"
              className="w-full px-4 py-2 rounded bg-[#2a2a2a] text-white"
              placeholder="Phone"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
            <input
              type="number"
              className="w-full px-4 py-2 rounded bg-[#2a2a2a] text-white"
              placeholder="Gold"
              value={formData.gold}
              onChange={(e) => setFormData({ ...formData, gold: Number(e.target.value) })}
            />
            <input
              type="number"
              className="w-full px-4 py-2 rounded bg-[#2a2a2a] text-white"
              placeholder="Diamond"
              value={formData.diamond}
              onChange={(e) => setFormData({ ...formData, diamond: Number(e.target.value) })}
            />

            <div>
              <label className="block text-sm mb-1">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="w-full text-white"
              />
            </div>

            <button
              onClick={() => setFormData({ ...formData, isBlocked: !formData.isBlocked })}
              className={`w-full px-4 py-2 rounded text-white ${
                formData.isBlocked ? "bg-yellow-600 hover:bg-yellow-700" : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {formData.isBlocked ? "Unblock User" : "Block User"}
            </button>

            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
