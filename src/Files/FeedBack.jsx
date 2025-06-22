import React, { useEffect, useState } from "react";

const maskEmail = (email) => {
  const [user, domain] = email.split("@");
  if (user.length <= 3) return "***@" + domain;
  return user.substring(0, 3) + "*".repeat(user.length - 3) + "@" + domain;
};

const FeedBack = () => {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://www.blackstonevoicechatroom.online/admin/all/feedback");
      const data = await res.json();
      setFeedback(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const res = await fetch("https://www.blackstonevoicechatroom.online/admin/update/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "resolved" }),
      });

      const data = await res.json();
      if (res.ok) {
        fetchFeedback(); // Refresh data
      } else {
        console.error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  return (
    <div className="flex flex-col md:flex-row bg-[#121212] min-h-screen text-white">

      <main className="flex-1 p-4 md:p-6 overflow-x-auto">
        <h2 className="text-2xl font-bold mb-6">Feedback List</h2>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[900px] w-full border border-gray-700 text-sm md:text-base">
              <thead className="bg-[#1f1f1f]">
                <tr>
                  <th className="px-4 py-2 border-b border-gray-700 text-left">Name</th>
                  <th className="px-4 py-2 border-b border-gray-700 text-left">UID</th>
                  <th className="px-4 py-2 border-b border-gray-700 text-left">Email</th>
                  <th className="px-4 py-2 border-b border-gray-700 text-left">Type</th>
                  <th className="px-4 py-2 border-b border-gray-700 text-left">Description</th>
                  <th className="px-4 py-2 border-b border-gray-700 text-left">Image</th>
                  <th className="px-4 py-2 border-b border-gray-700 text-left">Status</th>
                  <th className="px-4 py-2 border-b border-gray-700 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {feedback.map((fb) => (
                  <tr key={fb._id} className="hover:bg-[#2a2a2a] transition-colors">
                    <td className="px-4 py-3">{fb.name}</td>
                    <td className="px-4 py-3">{fb.uid}</td>
                    <td className="px-4 py-3 break-all">{maskEmail(fb.email)}</td>
                    <td className="px-4 py-3">{fb.problemType}</td>
                    <td className="px-4 py-3 max-w-xs break-words">{fb.description}</td>
                    <td className="px-4 py-3">
                      {fb.image && (
                        <img
                          src={fb.image}
                          alt="feedback"
                          className="w-12 h-12 md:w-16 md:h-16 object-cover rounded border border-gray-700"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          fb.status === "pending"
                            ? "bg-yellow-600"
                            : "bg-green-600"
                        }`}
                      >
                        {fb.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {fb.status !== "resolved" && (
                        <button
                          onClick={() => handleResolve(fb._id)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded-md"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {feedback.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4">
                      No feedback found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default FeedBack;
