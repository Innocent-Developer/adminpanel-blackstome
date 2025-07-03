import { useState, useEffect } from "react";
import { Trash2, Edit, X } from "lucide-react";
import { SHOP_API, CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from "../Apis/api";

export default function ShopAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ itemName: "", itemPrice: "", itemPic: null });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
  const res = await fetch(SHOP_API.ITEMS);
  const data = await res.json();
  setItems(Array.isArray(data) ? data : []);
};

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

    try {
      let imageUrl = "";
      if (form.itemPic) {
        imageUrl = await handleImageUpload(form.itemPic);
      }

      const payload = {
        itemName: form.itemName,
        itemPrice: form.itemPrice,
        itemPic: imageUrl,
      };

      const url = isEditMode ? SHOP_API.UPDATE : SHOP_API.CREATE;
      const method = "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditMode ? { ...payload, _id: editId } : payload),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setForm({ itemName: "", itemPrice: "", itemPic: null });
      setPreviewUrl(null);
      setIsEditMode(false);
      setShowModal(false);
      fetchItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setEditId(item.itemCode);
    setForm({ itemName: item.itemName, itemPrice: item.itemPrice, itemPic: null });
    setPreviewUrl(item.itemPic || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await fetch(SHOP_API.DELETE, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemCode: id }),
    });
    fetchItems();
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Shop Items</h2>
        <button
          onClick={() => {
            setForm({ itemName: "", itemPrice: "", itemPic: null });
            setPreviewUrl(null);
            setIsEditMode(false);
            setShowModal(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Create Item
        </button>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item._id} className="bg-gray-900 rounded-lg shadow p-4">
            <img
              src={item.itemPic}
              alt={item.itemName}
              className="w-full h-40 object-cover rounded"
            />
            <h4 className="text-lg mt-2 font-bold text-white">{item.itemName}</h4>
            <p className="text-sm text-gray-400">Price: ${item.itemPrice}</p>
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => handleEdit(item)}
                className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded text-sm"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.itemCode)}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-white mb-4">
              {isEditMode ? "Edit Item" : "Create New Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Item Name"
                value={form.itemName}
                onChange={(e) => setForm({ ...form, itemName: e.target.value })}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="number"
                placeholder="Item Price"
                value={form.itemPrice}
                onChange={(e) => setForm({ ...form, itemPrice: e.target.value })}
                required
                className="w-full p-2 rounded bg-gray-700 text-white"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-white"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                {isEditMode ? "Update Item" : "Create Item"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
