import React, { useState } from 'react';
import axios from 'axios';

const OfficialMessage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user'));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'blackstome'); // Your Cloudinary preset
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
      const response = await axios.post(
        'https://www.blackstonevoicechatroom.online/chats/users/admin/send',
        {
          title,
          content,
          image,
        },
        {
          headers: {
            userId: user?._id,
          },
        }
      );
      console.log('Response:', response.data);
      setMessage('Message sent successfully to all users.');
      setTitle('');
      setContent('');
      setImage('');
    } catch (err) {
      setError('Failed to send message.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl p-6 rounded-2xl bg-[#1e1e1e] shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Send Message to All Users</h2>

        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input
              type="text"
              className="w-full p-2 rounded-md bg-[#2a2a2a] border border-gray-700 focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Content *</label>
            <textarea
              className="w-full p-2 h-32 rounded-md bg-[#2a2a2a] border border-gray-700 focus:outline-none"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your message"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="text-sm"
            />
            {image && (
              <img
                src={image}
                alt="Preview"
                className="mt-3 rounded-md w-32 h-32 object-cover"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 rounded-lg transition duration-300"
          >
            {loading ? 'Sending...' : 'Send to All Users'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OfficialMessage;
