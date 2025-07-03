import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AllPosts = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: null,
    tags: [],
  });

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
      alert("Post Successfully Deleted");
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  const handleImageChange = (e) => {
    setNewPost({ ...newPost, image: e.target.files[0] });
  };

  const handleCreatePost = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const ui_id = user?.ui_id?.toString()?.trim();

    if (!newPost.title || !newPost.content || !ui_id) {
      alert('Title, Content, and User ID are required.');
      return;
    }

    try {
      let imageUrl = '';

      if (newPost.image) {
        const formData = new FormData();
        formData.append("file", newPost.image);
        formData.append("upload_preset", "blackstome");

        const cloudRes = await fetch("https://api.cloudinary.com/v1_1/dha65z0gy/image/upload", {
          method: "POST",
          body: formData,
        });

        const cloudData = await cloudRes.json();
        if (!cloudData.secure_url) throw new Error("Cloudinary upload failed.");
        imageUrl = cloudData.secure_url;
      }

      await axios.post("http://www.blackstonevoicechatroom.online/client/post/create", {
        title: newPost.title,
        content: newPost.content,
        images: imageUrl || '',
        ui_id,
        tags: newPost.tags
      });

      alert("Post created successfully!");
      setShowModal(false);
      setNewPost({ title: '', content: '', image: null, tags: [] });
      fetchPosts();

    } catch (error) {
      console.error("Error creating post:", error);
      alert("Failed to create post.");
    }
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.post_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">All Posts</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white"
          >
            + Create Post
          </button>
        </div>

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
                  <td colSpan="6" className="text-center p-4">Loading...</td>
                </tr>
              ) : (
                currentPosts.map((post) => (
                  <tr key={post._id} className="border-t border-gray-800">
                    <td className="p-2">{post.title}</td>
                    <td className="p-2">{post.content}</td>
                    <td className="p-2">{post.ui_id}</td>
                    <td className="p-2">{post.post_id || 'N/A'}</td>
                    <td className="p-2">{new Date(post.createdAt).toLocaleString()}</td>
                    <td className="p-2">
                      <button
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                        onClick={() => deletePost(post.post_id)}
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

      {/* Create Post Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded-md w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Create Post</h2>
            <input
              type="text"
              placeholder="Title"
              className="w-full p-2 mb-3 bg-gray-800 text-white rounded"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
            />
            <textarea
              placeholder="Content"
              className="w-full p-2 mb-3 bg-gray-800 text-white rounded"
              rows="4"
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
            />
            <input
              type="file"
              className="w-full p-2 mb-3 bg-gray-800 text-white rounded"
              onChange={handleImageChange}
            />
            <select
              multiple
              value={newPost.tags}
              onChange={(e) =>
                setNewPost({ ...newPost, tags: Array.from(e.target.selectedOptions, option => option.value) })
              }
              className="w-full p-2 mb-3 bg-gray-800 text-white rounded"
            >
              <option value="news">News</option>
              <option value="tech">Tech</option>
              <option value="gaming">Gaming</option>
              <option value="fun">Fun</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPosts;
