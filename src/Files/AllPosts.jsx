import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await axios.get('https://www.blackstonevoicechatroom.online/client/post/get');
      setPosts(res.data.posts || []);
    } catch (err) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-yellow-500">All User Posts</h1>

        {loading ? (
          <p className="text-center text-gray-400">Loading posts...</p>
        ) : error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-500">No posts found.</p>
        ) : (
          <div className="overflow-x-auto bg-[#1e1e1e] rounded-xl shadow-lg border border-gray-700">
            <table className="min-w-full text-sm text-left table-auto">
              <thead className="bg-yellow-500 text-black uppercase">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Content</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">Tags</th>
                  <th className="px-4 py-3">Comments</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr
                    key={post._id}
                    className="border-b border-gray-700 hover:bg-[#2a2a2a] transition"
                  >
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 break-words max-w-xs">{post.title}</td>
                    <td className="px-4 py-3 break-words max-w-xs">{post.content}</td>
                    <td className="px-4 py-3">
                      {post.images && post.images.length > 0 ? (
                        <img
                          src={post.images[0]}
                          alt="Post"
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-500">No Image</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{post.likes}</td>
                    <td className="px-4 py-3 break-words max-w-sm">
                      {post.tags && post.tags.length > 0
                        ? post.tags.join(', ')
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{post.comments?.length || 0}</td>
                    <td className="px-4 py-3">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllPosts;
