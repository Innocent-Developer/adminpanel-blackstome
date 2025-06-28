import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const AdminRoomChatPopup = ({ room, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));
  const adminUiId = user?.ui_id?.toString()?.trim();

  const bottomRef = useRef(null); // for auto-scroll

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        `https://www.blackstonevoicechatroom.online/room/${room.roomId}/chat`
      );
      setMessages(res.data.chat || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch messages.");
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!message.trim()) return;

    try {
      const res = await axios.post(
        `https://www.blackstonevoicechatroom.online/room/${room.roomId}/chat`,
        {
          ui_id: adminUiId,
          message,
        }
      );
      setMessage("");
      setError(""); // clear error on success
      fetchMessages(); // refresh messages
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setError(err.response.data.error); // e.g., ban message
      } else {
        setError("Failed to send message.");
      }
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [room.roomId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md max-h-[90vh] shadow-lg flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-bold">Room: {room.roomName}</h2>
            <p className="text-sm text-gray-600">Room ID: {room.roomId}</p>
            <p className="text-sm text-gray-600">You (Admin): {adminUiId}</p>
          </div>
          <button
            onClick={onClose}
            className="text-red-500 text-2xl font-bold hover:scale-110"
          >
            &times;
          </button>
        </div>

        {/* Chat Box */}
        <div className="chat-scroll flex-1 overflow-y-auto border p-2 rounded mb-4 space-y-2">
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-gray-500">No messages yet.</p>
          ) : (
            messages.map((msg, i) => {
              const senderId = (msg.sender || msg.ui_id || "").toString().trim();
              const isAdmin = senderId === adminUiId;

              return (
                <div
                  key={i}
                  className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] px-3 py-2 rounded-lg text-sm shadow ${
                      isAdmin
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-200 text-black rounded-bl-none"
                    }`}
                  >
                    <p className="font-semibold text-xs mb-1">
                      {isAdmin ? "You (Admin)" : senderId}
                    </p>
                    <p className="break-words whitespace-pre-wrap">
                      {msg.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input + Error */}
        <div className="flex flex-col gap-2">
          {error && (
            <div className="text-red-500 text-sm font-semibold px-2">
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={error.toLowerCase().includes("banned")}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              onClick={sendMessage}
              disabled={error.toLowerCase().includes("banned")}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRoomChatPopup;
