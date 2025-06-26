import React, { useEffect, useState } from "react";
import axios from "axios";

const RoomManager = () => {
  const [rooms, setRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showBanModal, setShowBanModal] = useState(false);
  const [banRoomId, setBanRoomId] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banType, setBanType] = useState("day");
  const [customHours, setCustomHours] = useState("");

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

  const toggleBanStatus = async (room) => {
    try {
      await axios.put(
        `https://www.blackstonevoicechatroom.online/toggle/ban/${room._id}`,
        { isBanned: !room.roomBan.isBanned }
      );
      fetchRooms();
    } catch (err) {
      console.error("Failed to toggle ban status", err);
    }
  };

  const handleBanRoom = async () => {
    try {
      const payload = {
        roomId: banRoomId,
        type: banType,
        reason: banReason,
      };
      if (banType === "custom") {
        payload.customDurationInHours = Number(customHours);
      }
      await axios.post("https://www.blackstonevoicechatroom.online/ban/room", payload);
      setShowBanModal(false);
      setBanRoomId(null);
      setBanReason("");
      setBanType("day");
      setCustomHours("");
      fetchRooms();
    } catch (err) {
      console.error("Failed to ban room", err.response?.data || err);
    }
  };

  const filteredRooms = rooms.filter((room) =>
    room.roomName.toLowerCase().includes(searchTerm.toLowerCase())||
    room.roomId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 text-white min-h-screen bg-[#0e0e0e]">
      <h1 className="text-3xl font-bold mb-6">All Rooms</h1>
      <input
        type="text"
        placeholder="Search by room name / roomId"
        className="mb-4 p-2 w-full md:w-1/2 rounded-md text-black"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700 text-sm md:text-base">
          <thead className="bg-[#1f1f1f]">
            <tr>
              <th className="p-3 border">Room Name</th>
              <th className="p-3 border">Room ID</th>
              <th className="p-3 border">Room Label</th>
              <th className="p-3 border">Max Users</th>
              <th className="p-3 border">Is Banned</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map((room) => (
              <tr key={room._id} className="border border-gray-800">
                <td className="p-3 border text-center">{room.roomName}</td>
                <td className="p-3 border text-center">{room.roomId}</td>
                <td className="p-3 border text-center">{room.roomLabel}</td>
                <td className="p-3 border text-center">{room.maxUsers}</td>
                <td className="p-3 border text-center">
                  {room.roomBan.isBanned ? "Yes" : "No"}
                </td>
                <td className="p-3 border text-center flex flex-col gap-2 md:flex-row justify-center items-center">
                  <button
                    onClick={() => deleteRoom(room.roomId)}
                    className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-md text-sm"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      if (room.roomBan.isBanned) {
                        toggleBanStatus(room);
                      } else {
                        setBanRoomId(room.roomId);
                        setShowBanModal(true);
                      }
                    }}
                    className={`$ {
                      room.roomBan.isBanned
                        ? "bg-green-600   hover:bg-green-700"
                        : "bg-yellow-600  hover:bg-yellow-700"
                    } px-3 py-1 rounded-md text-sm`}
                  >
                    {room.roomBan.isBanned ? "Unban" : "Ban"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ban Modal */}
      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-black p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ban Room</h2>

            <label className="block mb-2 font-medium">Reason</label>
            <input
              type="text"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
              placeholder="Enter reason"
            />

            <label className="block mb-2 font-medium">Ban Duration</label>
            <select
              value={banType}
              onChange={(e) => setBanType(e.target.value)}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="day">1 Day</option>
              <option value="month">1 Month</option>
              <option value="custom">Custom (Hours)</option>
              <option value="permanent">Permanent</option>
            </select>

            {banType === "custom" && (
              <input
                type="number"
                value={customHours}
                onChange={(e) => setCustomHours(e.target.value)}
                className="w-full p-2 mb-4 border rounded"
                placeholder="Enter hours"
              />
            )}

            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowBanModal(false)}
                className="bg-gray-300 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleBanRoom}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Confirm Ban
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomManager;
