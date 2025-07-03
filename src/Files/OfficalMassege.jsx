import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';

const OfficialMessage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const messagesPerPage = 10;

  const user = JSON.parse(localStorage.getItem('user'));

  const fetchMessages = async () => {
    try {
      const res = await axios.get(
        'https://www.blackstonevoicechatroom.online/chats/users/admin/get/messages',
        { headers: { userId: user?._id } }
      );
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'blackstome');
    setLoading(true);

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dha65z0gy/image/upload',
        formData
      );
      setImage(res.data.secure_url);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Image upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!content) {
      setError('Content is required.');
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        'https://www.blackstonevoicechatroom.online/chats/users/admin/send',
        { title, content, image },
        { headers: { userId: user?._id } }
      );
      setMessage('Message sent successfully.');
      setTitle('');
      setContent('');
      setImage('');
      setShowModal(false);
      fetchMessages();
    } catch (err) {
      setError('Failed to send message.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await axios.delete('https://www.blackstonevoicechatroom.online/chats/users/messages-delete', {
        data: { messageId }
      });
      fetchMessages();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-6 mt-16">
      <div className="max-w-6xl mx-auto w-full">
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition w-full sm:w-auto"
        >
          Send Message
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {messages
            .slice((currentPage - 1) * messagesPerPage, currentPage * messagesPerPage)
            .map((msg) => (
              <div
                key={msg._id}
                className="relative group bg-[#1e1e1e] border border-yellow-500 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300"
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Message"
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-4 flex flex-col justify-between h-full">
                  <h3 className="font-bold text-lg text-yellow-400 mb-2 line-clamp-1">
                    {msg.title || 'No Title'}
                  </h3>
                  <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                    {msg.content}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(msg._id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition duration-300"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
        </div>

        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>

          <span className="text-yellow-400 font-semibold">
            Page {currentPage} of {Math.ceil(messages.length / messagesPerPage)}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                prev < Math.ceil(messages.length / messagesPerPage) ? prev + 1 : prev
              )
            }
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
            disabled={currentPage === Math.ceil(messages.length / messagesPerPage)}
          >
            Next
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e1e1e] w-full max-w-md mx-auto p-6 rounded-xl shadow-xl border border-dashed border-yellow-500 text-white relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-center text-yellow-500 font-bold text-lg mb-4 uppercase">Official Message</h2>

            {message && <p className="text-green-500 text-sm mb-2">{message}</p>}
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Upload a File</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full bg-[#2a2a2a] p-2 rounded border border-gray-700"
                />
                {image && <img src={image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />}
              </div>

              <div>
                <label className="block text-sm mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#2a2a2a] p-2 rounded border border-gray-700"
                  placeholder="Write title"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-[#2a2a2a] p-2 h-28 rounded border border-gray-700"
                  placeholder="Write content"
                  required
                />
              </div>

              <div className="flex justify-between mt-4 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-600 px-4 py-2 rounded text-white hover:bg-gray-700 w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-yellow-500 text-black font-semibold px-4 py-2 rounded hover:bg-yellow-600 w-full sm:w-auto"
                >
                  {loading ? 'Sending...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialMessage;
