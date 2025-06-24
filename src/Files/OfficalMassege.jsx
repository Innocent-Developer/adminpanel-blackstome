import React, { useState, useEffect } from 'react';
import axios from 'axios';

const OfficialMessage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);

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
      <div className="max-w-4xl mx-auto w-full">
        <button
          onClick={() => setShowModal(true)}
          className="mb-6 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition w-full sm:w-auto"
        >
          Send Message
        </button>

        {/* Messages List */}
        <div className="grid gap-4">
          {messages.map((msg) => (
            <div key={msg._id} className="bg-[#1e1e1e] p-4 rounded-xl shadow-lg border border-gray-700">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <h3 className="font-semibold text-lg break-words">{msg.title || 'No Title'}</h3>
                <button
                  onClick={() => handleDelete(msg._id)}
                  className="text-red-500 text-sm hover:underline"
                >
                  Delete
                </button>
              </div>
              <p className="text-sm mt-2 break-words">{msg.content}</p>
              {msg.image && (
                <img src={msg.image} alt="msg" className="w-full max-w-xs mt-2 rounded-lg object-cover" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal Popup */}
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
