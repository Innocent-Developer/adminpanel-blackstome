import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminRoomChatPopup from "../Compontents/chatPage";

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBanModal, setShowBanModal] = useState(false);
  const [banRoomData, setBanRoomData] = useState(null);
  const [banType, setBanType] = useState("day");
  const [customDuration, setCustomDuration] = useState(1);
  const [banReason, setBanReason] = useState("");
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoomDetails, setSelectedRoomDetails] = useState(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(null);
  const [chatRoom, setChatRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newRoom, setNewRoom] = useState({
    roomName: "",
    roomLabel: "",
    roomKey: "",
    roomImage: "",
    roomThemeImage: "",
    members: [],
    maxUsers: 1,
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get(
        "https://www.blackstonevoicechatroom.online/user/get/rooms"
      );
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to fetch rooms", err);
    }
  };

  const deleteRoom = async (roomId) => {
    try {
      await axios.delete(
        `https://www.blackstonevoicechatroom.online/delete/room/${roomId}`
      );
      fetchRooms();
    } catch (err) {
      console.error("Failed to delete room", err);
    }
  };

  const toggleBanStatus = (room) => {
    if (room.roomBan?.isBanned) {
      // Directly unban if already banned
      unbanRoom(room.roomId);
    } else {
      // Show ban modal if not currently banned
      setBanRoomData(room);
      setShowBanModal(true);
    }
  };

  const confirmBanRoom = async () => {
    try {
      await axios.post("https://www.blackstonevoicechatroom.online/ban/room", {
        roomId: banRoomData.roomId,
        type: banType,
        reason: banReason,
        customDurationInHours:
          banType === "custom" ? customDuration : undefined,
      });
      setShowBanModal(false);
      fetchRooms();
    } catch (err) {
      console.error("Failed to ban room", err);
    }
  };

  // unban room   api featch
  const unbanRoom = async (roomId) => {
    try {
      await axios.post(
        "https://www.blackstonevoicechatroom.online/unban/room",
        {
          roomId,
        }
      );
      fetchRooms();
    } catch (err) {
      console.error("Failed to unban room", err);
    }
  };

  const createRoom = async () => {
    try {
      await axios.post(
        "https://www.blackstonevoicechatroom.online/user/create/room",
        newRoom
      );
      setShowCreateModal(false);
      setNewRoom({
        roomName: "",
        roomLabel: "",
        roomKey: "",
        roomImage: "",
        roomThemeImage: "",
        members: [],
        maxUsers: 1,
      });
      fetchRooms();
    } catch (err) {
      console.error("Failed to create room", err);
    }
  };

  // room join

  const joinRoom = async (roomId, ui_id, roomKey) => {
    try {
      const res = await axios.post(
        "https://www.blackstonevoicechatroom.online/room/join",
        {
          roomId,
          ui_id,
          roomKey,
        }
      );
      console.log(res.data.message); // "User joined room"
      return { success: true, message: res.data.message };
    } catch (err) {
      console.error("Join room error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.error || "Failed to join room",
      };
    }
  };
  const handleJoinRoom = async (room) => {
    const userString = localStorage.getItem("user");
    let ui_id = null;

    if (userString) {
      try {
        const user = JSON.parse(userString);
        ui_id = user?.ui_id;
      } catch (err) {
        console.error("Failed to parse user from localStorage:", err);
      }
    }

    console.log("ui_id:", ui_id);
    console.log("Joining room with ID:", room.roomId, "for user:", ui_id);

    const result = await joinRoom(room.roomId, ui_id, room.roomKey);

    if (result.success) {
      alert("Successfully joined the room!");
      setShowJoinModal(false);
      // Optionally: refresh rooms or redirect
      setChatRoom(room); // 👈 Show chat popup
      fetchRooms();
    } else {
      alert("Join failed: " + result.message);
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white p-4 sm:p-6 md:p-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">
        Room Manager
      </h1>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by room name || room ID"
          className="w-full md:w-1/2 p-2 rounded-md text-black"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white"
        >
          Create Room
        </button>
      </div>

      <div className="overflow-auto rounded-lg shadow border border-gray-700">
        <table className="min-w-full text-sm md:text-base text-left">
          <thead className="bg-[#1f1f1f] text-gray-200">
            <tr>
              <th className="px-4 py-3 border">Room Name</th>
              <th className="px-4 py-3 border">Room ID</th>
              <th className="px-4 py-3 border">Label</th>
              <th className="px-4 py-3 border">Max Users</th>
              <th className="px-4 py-3 border">Banned</th>
              <th className="px-4 py-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room._id} className="border-t border-gray-800">
                <td className="px-4 py-2 text-center">{room.roomName}</td>
                <td className="px-4 py-2 text-center">{room.roomId}</td>
                <td className="px-4 py-2 text-center">{room.roomLabel}</td>
                <td className="px-4 py-2 text-center">{room.maxUsers}</td>
                <td className="px-4 py-2 text-center">
                  {room.roomBan?.isBanned ? "Yes" : "No"}
                </td>
                <td className="border p-2 flex gap-2 justify-center">
                  <button
                    onClick={() => deleteRoom(room.roomId)}
                    className="bg-red-600 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => toggleBanStatus(room)}
                    className="bg-yellow-600 px-3 py-1 rounded"
                  >
                    {room.roomBan?.isBanned ? "Unban" : "Ban"}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedRoomDetails(room);
                      setShowDetailsModal(true);
                    }}
                    className="bg-blue-600 px-3 py-1 rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      setJoiningRoom(room);
                      handleJoinRoom(room);
                    }}
                    className="bg-purple-600 px-3 py-1 rounded"
                  >
                    Join
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-75 z-50">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Ban Room: {banRoomData?.roomName}
            </h2>

            <label className="block mb-2">Ban Type:</label>
            <select
              className="w-full p-2 mb-3 border rounded"
              value={banType}
              onChange={(e) => setBanType(e.target.value)}
            >
              <option value="day">1 Day</option>
              <option value="month">1 Month</option>
              <option value="custom">Custom (Hours)</option>
              <option value="permanent">Permanent</option>
            </select>

            {banType === "custom" && (
              <input
                type="number"
                placeholder="Hours"
                className="w-full p-2 mb-3 border rounded"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
              />
            )}

            <input
              type="text"
              placeholder="Reason"
              className="w-full p-2 mb-4 border rounded"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmBanRoom}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create New Room</h2>

            {Object.entries(newRoom).map(([field, value]) => {
              if (field === "members") return null;

              if (field === "roomLabel") {
                return (
                  <select
                    key={field}
                    className="w-full p-2 mb-3 border rounded"
                    value={value}
                    onChange={(e) =>
                      setNewRoom({ ...newRoom, [field]: e.target.value })
                    }
                  >
                    <option value="">Select Room Label</option>
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                );
              }

              return (
                <input
                  key={field}
                  type={field === "maxUsers" ? "number" : "text"}
                  placeholder={field}
                  className="w-full p-2 mb-3 border rounded"
                  value={value}
                  onChange={(e) =>
                    setNewRoom({
                      ...newRoom,
                      [field]:
                        field === "maxUsers"
                          ? Number(e.target.value)
                          : e.target.value,
                    })
                  }
                />
              );
            })}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={createRoom}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {/* room deaitls */}
      {showDetailsModal && selectedRoomDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
          <div className="bg-[#1e1e1e] text-white p-6 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg border border-gray-600">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Room Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(selectedRoomDetails).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700"
                >
                  <p className="text-gray-400 text-sm font-medium">{key}</p>
                  <pre className="whitespace-pre-wrap break-words text-white text-sm">
                    {Array.isArray(value)
                      ? value.length > 0
                        ? JSON.stringify(value, null, 2)
                        : "[]"
                      : typeof value === "object" && value !== null
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </pre>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => {
                  setChatRoom(selectedRoomDetails); // ✅ FIXED HERE
                  setShowDetailsModal(false); // Optional: close modal when opening chat
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition duration-200"
              >
                Chat Now
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Room Modal */}
      {showJoinModal && joiningRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
          <div className="bg-white text-black p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Join Room</h2>
            <p className="mb-4">
              Are you sure you want to join room:{" "}
              <strong>{joiningRoom.roomName}</strong>?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => handleJoinRoom(joiningRoom)}
                className="bg-purple-600 text-white px-4 py-2 rounded"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* chat room page   */}
      {chatRoom && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex justify-center items-center">
          <div className="bg-white text-black p-4 rounded-lg w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-xl text-gray-700"
              onClick={() => setChatRoom(null)}
            >
              &times;
            </button>
            <AdminRoomChatPopup
              room={chatRoom}
              ui_id={chatRoom.ui_id}
              onClose={() => setChatRoom(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManager;
