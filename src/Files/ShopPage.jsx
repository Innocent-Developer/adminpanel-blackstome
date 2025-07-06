import { useState, useEffect, useRef } from "react";
import { Trash2, Edit, X, Loader2, Plus } from "lucide-react";
import { SHOP_API } from "../Apis/api";

const categories = ["All", "Entrance", "Frame", "Bubblechat", "Theme"];

export default function ShopAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    itemName: "",
    itemPrices: { "7day": "", "14day": "", "30day": "" },
    itemPic: null,
    category: "Entrance",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftItem, setGiftItem] = useState(null); // item to gift
  const [targetUiId, setTargetUiId] = useState("");
  const [giftDuration, setGiftDuration] = useState("7day");

  const canvasRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(SHOP_API.ITEMS);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("UPLOADCARE_STORE", "1");
    formData.append("UPLOADCARE_PUB_KEY", "d005a40425905b107dec");
    formData.append("file", file);

    const res = await fetch("https://upload.uploadcare.com/base/", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!data.file) throw new Error("Uploadcare upload failed");

    return `https://ucarecdn.com/${data.file}/`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let fileUrl = previewUrl;

      if (form.itemPic) {
        fileUrl = await handleImageUpload(form.itemPic);
      }

      const payload = {
        itemName: form.itemName,
        itemPic: fileUrl,
        category: form.category,
        itemPrices: {
          "7day": Number(form.itemPrices["7day"]),
          "14day": Number(form.itemPrices["14day"]),
          "30day": Number(form.itemPrices["30day"]),
        },
      };

      const url = isEditMode ? SHOP_API.UPDATE : SHOP_API.CREATE;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEditMode ? { ...payload, _id: editId } : payload
        ),
      });

      if (!res.ok) throw new Error("Failed to submit item.");

      setForm({
        itemName: "",
        itemPrices: { "7day": "", "14day": "", "30day": "" },
        itemPic: null,
        category: "Entrance",
      });
      setPreviewUrl(null);
      setIsEditMode(false);
      setShowModal(false);
      setEditId(null);
      if (playerRef.current?.clear) playerRef.current.clear();

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
      itemPrices: {
        "7day": item.itemPrices?.["7day"] || "",
        "14day": item.itemPrices?.["14day"] || "",
        "30day": item.itemPrices?.["30day"] || "",
      },
      itemPic: null,
      category: item.category || "Entrance",
    });
    setPreviewUrl(item.itemPic || null);
    setShowModal(true);
    if (playerRef.current?.clear) playerRef.current.clear();
  };

  const handleDelete = async (itemCode) => {
    if (!window.confirm("Delete this item?")) return;
    setLoading(true);
    try {
      const res = await fetch(SHOP_API.DELETE, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemCode }),
      });

      if (!res.ok) throw new Error("Failed to delete item.");
      fetchItems();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, itemPic: file });

    if (!file) return setPreviewUrl(null);

    const isSVGA = file.name?.endsWith(".svga");

    const reader = new FileReader();
    reader.onload = () => {
      if (isSVGA) {
        const arrayBuffer = reader.result;
        playSVGA(arrayBuffer);
        setPreviewUrl(null); // no image preview for svga
      } else {
        setPreviewUrl(reader.result);
        if (playerRef.current?.clear) playerRef.current.clear();
      }
    };

    if (isSVGA) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsDataURL(file);
    }
  };
  const handleSendGift = async () => {
    if (!targetUiId || !giftItem?.itemCode || !giftDuration)
      return alert("Please enter a valid UI ID.");

    try {
      const res = await fetch(SHOP_API.SEND_GIFT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ui_id: targetUiId,
          itemCode: giftItem.itemCode,
          durication: giftDuration,
        }),
      });

      if (!res.ok) throw new Error("Failed to send gift.");

      alert("🎁 Gift sent successfully!");
      setShowGiftModal(false);
      setGiftItem(null);
      setTargetUiId("");
    } catch (err) {
      alert(err.message);
    }
  };

  const playSVGA = async (arrayBuffer) => {
    if (!canvasRef.current || !window.SVGA) return;

    const playerInstance = new window.SVGA.PlayerLite(canvasRef.current);
    const parser = new window.SVGA.ParserLite();
    const videoItem = await parser.do(arrayBuffer);

    playerInstance.setVideoItem(videoItem);
    playerInstance.startAnimation();
    playerRef.current = playerInstance;
  };

  return (
    <div className="p-6 bg-[#0f0f1b] min-h-screen text-white">
      {/* header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">🛒 Shop Admin</h2>
        <button
          onClick={() => {
            setForm({
              itemName: "",
              itemPrices: { "7day": "", "14day": "", "30day": "" },
              itemPic: null,
              category: "Entrance",
            });
            setPreviewUrl(null);
            setIsEditMode(false);
            setEditId(null);
            setShowModal(true);
            if (playerRef.current?.clear) playerRef.current.clear();
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={18} />
          Create Item
        </button>
      </div>

      {/* category filter */}
      <div className="mb-6">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 text-white py-2 px-4 rounded-lg border border-gray-700"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* loader */}
      {loading && (
        <div className="flex justify-center my-10">
          <Loader2 className="animate-spin text-white" size={36} />
        </div>
      )}

      {/* item cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-[#1a1a2e] rounded-xl shadow-lg p-4">
            <img
              src={item.itemPic}
              alt={item.itemName}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
            <div>
              <h4 className="text-xl font-semibold mb-1">{item.itemName}</h4>
              <p className="text-sm text-gray-400">
                💰 7d: ${item.itemPrices?.["7day"]} | 14d: $
                {item.itemPrices?.["14day"]} | 30d: $
                {item.itemPrices?.["30day"]}
              </p>
              <p className="text-sm text-gray-500">📦 {item.category}</p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleEdit(item)}
                  className="bg-yellow-500 hover:bg-yellow-600 p-2 rounded-md"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.itemCode || item._id)}
                  className="bg-red-500 hover:bg-red-600 p-2 rounded-md"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => {
                    setGiftItem(item);
                    setShowGiftModal(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 p-2 rounded-md"
                >
                  🎁
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#121225] p-6 rounded-2xl w-full max-w-lg relative border border-purple-800">
            <button
              onClick={() => {
                setShowModal(false);
                if (playerRef.current?.clear) playerRef.current.clear();
              }}
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
                className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
              />
              <div className="grid grid-cols-3 gap-2">
                {["7day", "14day", "30day"].map((period) => (
                  <input
                    key={period}
                    type="number"
                    placeholder={`${period}-price`}
                    value={form.itemPrices[period]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        itemPrices: {
                          ...form.itemPrices,
                          [period]: e.target.value,
                        },
                      })
                    }
                    required
                    className="bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                  />
                ))}
              </div>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
              >
                {categories
                  .filter((cat) => cat !== "All")
                  .map((cat) => (
                    <option key={cat}>{cat}</option>
                  ))}
              </select>
              <input
                type="file"
                accept=".svga,image/*"
                onChange={handleFileChange}
                className="text-white"
              />

              {form.itemPic?.name?.endsWith(".svga") ? (
                <canvas
                  ref={canvasRef}
                  width="200"
                  height="200"
                  className="rounded-md border border-gray-600 mt-2"
                />
              ) : previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded mt-2"
                />
              ) : null}

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
      {/* gift modal */}

      {showGiftModal && giftItem && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#121225] p-6 rounded-2xl w-full max-w-md relative border border-green-700">
            <button
              onClick={() => {
                setShowGiftModal(false);
                setGiftItem(null);
                setTargetUiId("");
              }}
              className="absolute top-4 right-4 text-white hover:text-red-400"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-green-400">
              Send Gift: {giftItem.itemName}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Target UI ID"
                value={targetUiId}
                onChange={(e) => setTargetUiId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
              />
              <select
                value={giftDuration}
                onChange={(e) => setGiftDuration(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
              >
                <option value="7day">7 Days</option>
                <option value="14day">14 Days</option>
                <option value="30day">30 Days</option>
              </select>
              <button
                onClick={handleSendGift}
                className="w-full bg-green-600 hover:bg-green-700 p-2 rounded-lg text-white font-semibold"
              >
                Send Gift 🎁
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
