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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);

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

  // Upload file using the provided API endpoint
  const handleImageUpload = async (file) => {
    try {
      setUploadProgress(0);
      setUploadError(null);
      
      const formData = new FormData();
      formData.append("file", file);
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      });
      
      return new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              // Assuming the API returns the file URL in a 'fileUrl' field
              const fileUrl = response.fileUrl || response.url || response.location;
              if (fileUrl) {
                resolve(fileUrl);
              } else {
                reject(new Error("No file URL returned from server"));
              }
            } catch (error) {
              reject(new Error("Failed to parse server response"));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        });
        
        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed due to network error"));
        });
        
        xhr.open("POST", "https://www.blackstonavoicechatroom.online/upload/file");
        xhr.send(formData);
      });
      
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadError(error.message);
      throw new Error("Failed to upload file to storage");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadError(null);
    
    try {
      let fileUrl = form.itemPic;

      // If there's a new file to upload (and it's not already a URL string)
      if (form.itemPic && typeof form.itemPic !== 'string') {
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
      setUploadProgress(0);
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
      itemPic: item.itemPic, // Keep as URL string for existing images
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
    if (!file) return setPreviewUrl(null);
    
    setForm({ ...form, itemPic: file });
    setUploadError(null);

    const isSVGA = file.name?.toLowerCase().endsWith(".svga");

    const reader = new FileReader();
    reader.onload = () => {
      if (isSVGA) {
        const arrayBuffer = reader.result;
        playSVGA(arrayBuffer);
        setPreviewUrl(null);
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

  const playSVGA = async (arrayBuffer) => {
    if (!canvasRef.current || !window.SVGA) return;

    try {
      const playerInstance = new window.SVGA.PlayerLite(canvasRef.current);
      const parser = new window.SVGA.ParserLite();
      const videoItem = await parser.do(arrayBuffer);

      playerInstance.setVideoItem(videoItem);
      playerInstance.startAnimation();
      playerRef.current = playerInstance;
    } catch (error) {
      console.error("Error playing SVGA:", error);
      setUploadError("Failed to preview SVGA file");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-[#0f0f1b] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold">🛒 Shop Admin</h2>
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
            setUploadError(null);
            if (playerRef.current?.clear) playerRef.current.clear();
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
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
          className="bg-gray-800 text-white py-2 px-4 rounded-lg border border-gray-700 w-full sm:w-auto"
        >
          {categories.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Loader */}
      {loading && !showModal && (
        <div className="flex justify-center my-10">
          <Loader2 className="animate-spin text-white" size={36} />
        </div>
      )}

      {/* Item Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item._id} className="bg-[#1a1a2e] rounded-xl shadow-lg p-4">
            <img
              src={item.itemPic}
              alt={item.itemName}
              className="w-full h-30 sm:h-48 object-cover rounded-lg mb-3"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/200x200/1a1a2e/ffffff?text=Image+Not+Found";
              }}
            />
            <div>
              <h4 className="text-lg font-semibold mb-1">{item.itemName}</h4>
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121225] p-6 rounded-2xl w-full max-w-lg relative border border-purple-800 overflow-y-auto max-h-[90vh]">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                    min="0"
                    step="0.01"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Item Image/File
                </label>
                <input
                  type="file"
                  accept=".svga,image/*"
                  onChange={handleFileChange}
                  className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uploading: {Math.round(uploadProgress)}%</p>
                  </div>
                )}
                {uploadError && (
                  <p className="text-red-400 text-xs mt-1">{uploadError}</p>
                )}
              </div>
              
              {form.itemPic && form.itemPic.name && form.itemPic.name.toLowerCase().endsWith(".svga") ? (
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
              ) : form.itemPic && typeof form.itemPic === 'string' ? (
                <img
                  src={form.itemPic}
                  alt="Current"
                  className="w-full h-40 object-cover rounded mt-2"
                />
              ) : null}
              
              <button
                type="submit"
                disabled={loading || (uploadProgress > 0 && uploadProgress < 100)}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-600 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
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