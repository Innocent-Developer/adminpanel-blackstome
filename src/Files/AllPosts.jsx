import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://www.blackstonevoicechatroom.online/client/post/get');
      setPosts(res.data.posts);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const deletePost = async (postId) => {
    try {
      await axios.delete('https://www.blackstonevoicechatroom.online/post/delete', {
        data: { postId },
      });
      setPosts(posts.filter((post) => post.post_id !== postId));
      alert("Post Successfull Delete ")

    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())||
    post.post_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">All Posts</h1>

        <input
          type="text"
          placeholder="Search by title..."
          className="mb-4 w-full md:w-1/3 p-2 rounded-md bg-[#1e1e1e] border border-gray-700 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left border border-gray-700">
            <thead className="bg-[#1e1e1e]">
              <tr>
                <th className="p-2 border border-gray-700">Title</th>
                <th className="p-2 border border-gray-700">Content</th>
                <th className="p-2 border border-gray-700">UI ID</th>
                <th className="p-2 border border-gray-700">Post ID</th>
                <th className="p-2 border border-gray-700">Created At</th>
                <th className="p-2 border border-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    Loading...
                  </td>
                </tr>
              ) : (
                currentPosts.map((post) => (
                  <tr key={post._id} className="border-t border-gray-800">
                    <td className="p-2">{post.title}</td>
                    <td className="p-2">{post.content}</td>
                    <td className="p-2">{post.ui_id}</td>
                    <td className="p-2">{post.post_id || 'N/A'}</td>
                    <td className="p-2">{new Date(post.createdAt).toLocaleString()}</td>
                    <td className="p-2 flex gap-2">
                      {/* Add edit modal logic here */}
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                        onClick={() => deletePost(post.post_id )}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`px-3 py-1 rounded-md border border-gray-600 ${
                currentPage === num ? 'bg-yellow-500 text-black' : 'bg-[#1e1e1e] text-white'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllPosts;
