import { useState, useEffect, useRef } from "react";
import { Trash2, Edit, X, Loader2, Plus } from "lucide-react";

// API endpoints
const BASE_URL= "https://www.blackstonevoicechatroom.online";
const SHOP_API = {
  CREATE: `${BASE_URL}/shop/create`,
  ITEMS: `${BASE_URL}/shop/items`,
  UPDATE: `${BASE_URL}/shop/update/item`,
  DELETE: `${BASE_URL}/shop/delete/item`,
  UPLOAD: `${BASE_URL}/upload/file`, // The upload endpoint from your screenshot
};

const categories = ["All", "Entrance", "Frame", "Bubblechat", "Theme"];

export default function ShopAdminPage() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    itemName: "",
    itemPrices: { "7day": "", "14day": "", "30day": "" },
    itemPic: null,
    category: "Entrance",
    image: null, // New field for image upload
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // New state for image preview
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUploadProgress, setImageUploadProgress] = useState(0); // New state for image upload progress
  const [uploadError, setUploadError] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null); // New state for image upload error

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

  // Generic file upload function
  const handleFileUpload = async (file, progressSetter, errorSetter) => {
    try {
      progressSetter(0);
      errorSetter(null);
      
      const formData = new FormData();
      formData.append("file", file);
      
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          progressSetter(percentComplete);
        }
      });
      
      return new Promise((resolve, reject) => {
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              if (response.success && response.fileUrl) {
                resolve(response.fileUrl);
              } else {
                reject(new Error(response.message || "Upload failed"));
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
        
        xhr.open("POST", SHOP_API.UPLOAD);
        xhr.send(formData);
      });
      
    } catch (error) {
      console.error("Upload failed:", error);
      errorSetter(error.message);
      throw error;
    }
  };

  // Upload itemPic file
  const handleImageUpload = async (file) => {
    return handleFileUpload(file, setUploadProgress, setUploadError);
  };

  // Upload image file (new field)
  const handleAdditionalImageUpload = async (file) => {
    return handleFileUpload(file, setImageUploadProgress, setImageUploadError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadError(null);
    setImageUploadError(null);
    
    try {
      let fileUrl = form.itemPic;
      let imageUrl = form.image;

      // If there's a new itemPic file to upload (and it's not already a URL string)
      if (form.itemPic && typeof form.itemPic !== 'string') {
        fileUrl = await handleImageUpload(form.itemPic);
      }

      // If there's a new image file to upload (and it's not already a URL string)
      if (form.image && typeof form.image !== 'string') {
        imageUrl = await handleAdditionalImageUpload(form.image);
      }

      const payload = {
        itemName: form.itemName,
        itemPic: fileUrl,
        category: form.category,
        image: imageUrl, // Include the image URL in the payload
        itemPrices: {
          "7day": Number(form.itemPrices["7day"]),
          "14day": Number(form.itemPrices["14day"]),
          "30day": Number(form.itemPrices["30day"]),
        },
      };

      const url = isEditMode ? `${SHOP_API.UPDATE}/${editId}` : SHOP_API.CREATE;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit item");
      }

      setForm({
        itemName: "",
        itemPrices: { "7day": "", "14day": "", "30day": "" },
        itemPic: null,
        image: null,
        category: "Entrance",
      });
      setPreviewUrl(null);
      setImagePreviewUrl(null);
      setIsEditMode(false);
      setShowModal(false);
      setEditId(null);
      if (playerRef.current?.clear) playerRef.current.clear();

      fetchItems();
    } catch (err) {
      const errorMessage = err.message || "An error occurred";
      setUploadError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setImageUploadProgress(0);
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
      itemPic: item.itemPic,
      image: item.image || null,
      category: item.category || "Entrance",
    });
    setPreviewUrl(item.itemPic || null);
    setImagePreviewUrl(item.image || null);
    setShowModal(true);
    if (playerRef.current?.clear) playerRef.current.clear();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${SHOP_API.DELETE}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete item");
      
      fetchItems();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, isImageField = false) => {
    const file = e.target.files[0];
    if (!file) {
      if (isImageField) {
        setImagePreviewUrl(null);
        setForm({ ...form, image: null });
      } else {
        setPreviewUrl(null);
        setForm({ ...form, itemPic: null });
      }
      return;
    }
    
    if (isImageField) {
      setForm({ ...form, image: file });
      setImageUploadError(null);
    } else {
      setForm({ ...form, itemPic: file });
      setUploadError(null);
    }

    const isSVGA = file.name?.toLowerCase().endsWith(".svga");

    const reader = new FileReader();
    reader.onload = () => {
      if (isSVGA && !isImageField) {
        const arrayBuffer = reader.result;
        playSVGA(arrayBuffer);
        setPreviewUrl(null);
      } else if (isImageField) {
        setImagePreviewUrl(reader.result);
      } else {
        setPreviewUrl(reader.result);
        if (playerRef.current?.clear) playerRef.current.clear();
      }
    };

    if (isSVGA && !isImageField) {
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
              image: null,
              category: "Entrance",
            });
            setPreviewUrl(null);
            setImagePreviewUrl(null);
            setIsEditMode(false);
            setEditId(null);
            setShowModal(true);
            setUploadError(null);
            setImageUploadError(null);
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
            <option key={cat} value={cat}>{cat}</option>
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
              className="w-full h-48 object-cover rounded-lg mb-3"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/200x200/1a1a2e/ffffff?text=Image+Not+Found";
              }}
            />
            {item.image && (
              <img
                src={item.image}
                alt={`${item.itemName} additional`}
                className="w-full h-48 object-cover rounded-lg mb-3"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/200x200/1a1a2e/ffffff?text=Image+Not+Found";
                }}
              />
            )}
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
                  onClick={() => handleDelete(item._id)}
                  className="bg-red-500 hover:bg-red-600 p-2 rounded-md"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400">No items found. Create your first item!</p>
        </div>
      )}

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
                    placeholder={`${period} price`}
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
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
              </select>
              
              {/* Item Image/File Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Item Image/File
                </label>
                <input
                  type="file"
                  accept=".svga,image/*"
                  onChange={(e) => handleFileChange(e, false)}
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
              
              {/* Additional Image Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Additional Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                />
                {imageUploadProgress > 0 && imageUploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${imageUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uploading: {Math.round(imageUploadProgress)}%</p>
                  </div>
                )}
                {imageUploadError && (
                  <p className="text-red-400 text-xs mt-1">{imageUploadError}</p>
                )}
              </div>
              
              {/* Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {form.itemPic && form.itemPic.name && form.itemPic.name.toLowerCase().endsWith(".svga") ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Item Preview:</p>
                    <canvas
                      ref={canvasRef}
                      width="200"
                      height="200"
                      className="rounded-md border border-gray-600 w-full"
                    />
                  </div>
                ) : previewUrl ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Item Preview:</p>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ) : form.itemPic && typeof form.itemPic === 'string' ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Current Item:</p>
                    <img
                      src={form.itemPic}
                      alt="Current"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ) : null}
                
                {imagePreviewUrl ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Additional Image Preview:</p>
                    <img
                      src={imagePreviewUrl}
                      alt="Additional Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ) : form.image && typeof form.image === 'string' ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Current Additional Image:</p>
                    <img
                      src={form.image}
                      alt="Current Additional"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ) : null}
              </div>
              
              <button
                type="submit"
                disabled={loading || (uploadProgress > 0 && uploadProgress < 100) || (imageUploadProgress > 0 && imageUploadProgress < 100)}
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