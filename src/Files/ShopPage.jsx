import { useState, useEffect } from "react";
import { Trash2, Edit, X, Loader2, Plus } from "lucide-react";
import {
  SHOP_API,
  CLOUDINARY_UPLOAD_URL,
  CLOUDINARY_UPLOAD_PRESET,
} from "../Apis/api";

const categories = ["All", "Entrance", "Frame", "Bubblechat", "Theme"];

export default function ShopAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    itemName: "",
    itemPrice: "",
    itemPic: null,
    category: "Entrance",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const res = await fetch(SHOP_API.ITEMS);
    const data = await res.json();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const cloudRes = await fetch(CLOUDINARY_UPLOAD_URL, {
      method: "POST",
      body: formData,
    });

    const cloudData = await cloudRes.json();
    if (!cloudData.secure_url) throw new Error("Cloudinary upload failed.");
    return cloudData.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = previewUrl;

      if (form.itemPic) {
        imageUrl = await handleImageUpload(form.itemPic);
      }

      const payload = {
        itemName: form.itemName,
        itemPrice: form.itemPrice,
        itemPic: imageUrl,
        category: form.category,
      };

      const url = isEditMode ? SHOP_API.UPDATE : SHOP_API.CREATE;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditMode ? { ...payload, _id: editId } : payload),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setForm({ itemName: "", itemPrice: "", itemPic: null, category: "Entrance" });
      setPreviewUrl(null);
      setIsEditMode(false);
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setEditId(item._id);
    setForm({
      itemName: item.itemName,
      itemPrice: item.itemPrice,
      itemPic: null,
      category: item.category || "Entrance",
    });
    setPreviewUrl(item.itemPic || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    setLoading(true);
    await fetch(SHOP_API.DELETE, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemCode: id }),
    });
    fetchItems();
    setLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, itemPic: file });

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  return (
    <div className="p-6 bg-[#0f0f1b] min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">🛒 Shop Admin</h2>
        <button
          onClick={() => {
            setForm({ itemName: "", itemPrice: "", itemPic: null, category: "Entrance" });
            setPreviewUrl(null);
            setIsEditMode(false);
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 text-white px-4 py-2 rounded-lg transition duration-200 shadow-md"
        >
          <Plus size={18} />
          Create Item
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 text-white py-2 px-4 rounded-lg border border-gray-700 focus:outline-none"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center my-10">
          <Loader2 className="animate-spin text-white" size={36} />
        </div>
      )}

      {/* Item Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-[#1a1a2e] rounded-xl shadow-lg p-4 transition hover:scale-105 hover:shadow-xl duration-300">
            <img
              src={item.itemPic}
              alt={item.itemName}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
            <div>
              <h4 className="text-xl font-semibold mb-1">{item.itemName}</h4>
              <p className="text-sm text-gray-400">💰 ${item.itemPrice}</p>
              <p className="text-sm text-gray-500">📦 {item.category}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-md"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.itemCode)}
                  className="bg-red-500 hover:bg-red-600 p-2 rounded-md"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#121225] p-6 rounded-2xl w-full max-w-lg relative border border-purple-800 shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-white hover:text-red-400"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-purple-400">
              {isEditMode ? "Edit Item" : "Create New Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white placeholder:text-gray-400"
              />
              <input
                type="number"
                placeholder="Item Price"
                value={form.itemPrice}
                onChange={(e) => setForm({ ...form, itemPrice: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white placeholder:text-gray-400"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
              >
                {categories.filter((cat) => cat !== "All").map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="text-white"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded mt-2"
                />
              )}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update Item"
                ) : (
                  "Create Item"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
