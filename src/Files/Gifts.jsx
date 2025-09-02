import React, { useEffect, useState } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const GiftAdminPage = () => {
  const [gifts, setGifts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [form, setForm] = useState({
    giftName: "",
    amount: "",
    giftCategory: "normal",
    giftImage: "",
    giftFile: "",
  });

  const fetchGifts = async () => {
    try {
      const res = await axios.get(
        "https://www.blackstonevoicechatroom.online/api/v2/client/gift/get/all"
      );
      setGifts(res.data?.gifts || []);
    } catch (err) {
      toast.error("Failed to fetch gifts");
    }
  };

  const handleDeleteGift = async (giftId) => {
    if (!window.confirm("Are you sure you want to delete this gift?")) return;

    try {
      const res = await axios.delete(
        `https://www.blackstonevoicechatroom.online/api/v2/admin/gift/delete/${giftId}`
      );
      
      if (res.data.success) {
        toast.success("Gift deleted successfully!");
        fetchGifts(); // Refresh the gift list
      } else {
        toast.error("Failed to delete gift");
      }
    } catch (err) {
      toast.error("Error deleting gift");
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const handleImageUpload = async (e) => {
    const imageFile = e.target.files[0];
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "blackstome");

    setIsUploadingImage(true);
    try {
      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/dha65z0gy/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await cloudRes.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed");

      setForm((prev) => ({ ...prev, giftImage: data.secure_url }));
      toast.success("Image uploaded!");
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("UPLOADCARE_STORE", "1");
    formData.append("UPLOADCARE_PUB_KEY", "d005a40425905b107dec");

    setIsUploadingFile(true);
    try {
      const res = await fetch("https://upload.uploadcare.com/base/", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.content);

      setForm((prev) => ({
        ...prev,
        giftFile: `https://ucarecdn.com/${data.file}/`,
      }));
      toast.success("File uploaded!");
    } catch (err) {
      toast.error(`File upload failed: ${err.message}`);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://www.blackstonevoicechatroom.online/api/v2/admin/gift/create",
        form
      );

      if (res.data.success) {
        fetchGifts();
        setIsModalOpen(false);
        setForm({
          giftName: "",
          amount: "",
          giftCategory: "normal",
          giftImage: "",
          giftFile: "",
        });
        toast.success("Gift created successfully!");
      } else {
        toast.error("Gift creation failed");
      }
    } catch (err) {
      toast.error("Error creating gift");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-[#121212] text-yellow-400 relative mt-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">🎁 Gift Manager</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-yellow-400 text-black font-semibold px-5 py-2 rounded shadow hover:bg-yellow-300 transition"
        >
          + Add Gift
        </button>
      </div>

      {/* Gift Table */}
      <div className="overflow-x-auto rounded-lg border border-yellow-500">
        <table className="min-w-full text-sm">
          <thead className="bg-yellow-500 text-black">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Category</th>
              <th className="p-3">Image</th>
              <th className="p-3">File</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {gifts.map((gift) => (
              <tr
                key={gift._id}
                className="border-t border-yellow-700 hover:bg-yellow-900/20"
              >
                <td className="p-3">{gift.giftName}</td>
                <td className="p-3">${gift.amount}</td>
                <td className="p-3 capitalize">{gift.giftCategory}</td>
                <td className="p-3">
                  <img
                    src={gift.giftImage}
                    alt="gift"
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="p-3">
                  <a
                    href={gift.giftFile}
                    target="_blank"
                    rel="noreferrer"
                    className="text-yellow-400 underline hover:text-yellow-300"
                  >
                    View File
                  </a>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => handleDeleteGift(gift._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-500 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="bg-yellow-900 text-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-center text-yellow-400">
              ➕ Add New Gift
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Gift Name"
                value={form.giftName}
                onChange={(e) => setForm({ ...form, giftName: e.target.value })}
                className="w-full p-2 rounded bg-black text-yellow-300 placeholder-yellow-600 border border-yellow-500"
                required
              />
              <input
                type="number"
                placeholder="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full p-2 rounded bg-black text-yellow-300 placeholder-yellow-600 border border-yellow-500"
                required
              />
              <select
                value={form.giftCategory}
                onChange={(e) =>
                  setForm({ ...form, giftCategory: e.target.value })
                }
                className="w-full p-2 rounded bg-black text-yellow-300 border border-yellow-500"
              >
                <option value="normal">Normal</option>
                <option value="event">Event</option>
                <option value="special">Special</option>
                <option value="rebate">Rebate</option>
                <option value="country">Country</option>
                <option value="personality">Personality</option>
                <option value="nobel">Nobel</option>
                <option value="cp">CP</option>
              </select>

              {/* Image Upload */}
              <div>
                <label className="block mb-1 text-yellow-300 font-medium">
                  Gift Image (Cloudinary)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full text-yellow-300 bg-black border border-yellow-500 rounded"
                />
                {isUploadingImage && (
                  <p className="text-sm text-yellow-400 mt-1">Uploading image...</p>
                )}
                {form.giftImage && (
                  <img
                    src={form.giftImage}
                    alt="preview"
                    className="w-24 h-24 mt-2 rounded border border-yellow-500"
                  />
                )}
              </div>

              {/* File Upload */}
              <div>
                <label className="block mb-1 text-yellow-300 font-medium">
                  Gift File (Uploadcare)
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full text-yellow-300 bg-black border border-yellow-500 rounded"
                />
                {isUploadingFile && (
                  <p className="text-sm text-yellow-400 mt-1">Uploading file...</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="w-full bg-yellow-400 text-black py-2 rounded hover:bg-yellow-300 font-semibold transition"
                  disabled={isUploadingImage || isUploadingFile}
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-gray-800 text-yellow-400 py-2 rounded hover:bg-gray-700 font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftAdminPage;