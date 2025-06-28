// src/components/AdminRoomChatPopup.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const AdminRoomChatPopup = ({ roomId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
const user = JSON.parse(localStorage.getItem("user"));
const ui_id = user?.ui_id; // This will be a number
  // Fetch messages for the room
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`https://www.blackstonevoicechatroom.online/room/${roomId}/chat`);
      setMessages(res.data.chat || []);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load messages.");
      setLoading(false);
    }
  };

  // Send new message
  const sendMessage = async () => {
    if (!message.trim()) return;
    try {
      await axios.post(`https://www.blackstonevoicechatroom.online/room/${roomId}/chat`, {
        ui_id,
        message,
      });
      setMessage("");
      fetchMessages();
    } catch (err) {
      setError(err.response?.data?.error || "Could not send message.");
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [roomId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Chat in Room: {roomId}</h2>
          <h2 className="text-lg font-bold">AdminId : {ui_id}</h2>
          <button onClick={onClose} className="text-red-500 text-xl font-bold">&times;</button>
        </div>

        <div className="h-64 overflow-y-auto border p-2 rounded mb-4">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-2 ${msg.sender === ui_id ? "text-right" : "text-left"}`}
              >
                <p className="text-sm font-semibold">{msg.sender}</p>
                <p className="bg-gray-200 inline-block p-2 rounded">{msg.message}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminRoomChatPopup;
