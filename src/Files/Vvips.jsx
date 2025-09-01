import { useState, useEffect, useRef } from "react";
import { Trash2, Edit, X, Loader2, Plus, Crown } from "lucide-react";

// API endpoints
const BASE_URL = "https://www.blackstonevoicechatroom.online";
const VIP_API = {
  CREATE: `${BASE_URL}/admin/create/vvpis/item`,
  ITEMS: `${BASE_URL}/get/all/vvpis/items`,
  UPDATE: `${BASE_URL}/admin/update/vvpis/item`,
  DELETE: `${BASE_URL}/admin/delete/vvpis/item`,
  UPLOAD: `${BASE_URL}/upload/file`,
};

export default function Vvips() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    ui_id: "",
    vipTital: "",
    vipDescription: "",
    vpiframe: null,
    pic: null,
    bubbleChat: "",
    entarneentarneShow: "",
    price: "",
    days: "",
    spicelGift: "",
    profileheadware: ""
  });
  const [framePreviewUrl, setFramePreviewUrl] = useState(null);
  const [picPreviewUrl, setPicPreviewUrl] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frameUploadProgress, setFrameUploadProgress] = useState(0);
  const [picUploadProgress, setPicUploadProgress] = useState(0);
  const [frameUploadError, setFrameUploadError] = useState(null);
  const [picUploadError, setPicUploadError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(VIP_API.ITEMS);
      const data = await res.json();
      // Check if the response has vvpiItems array
      setItems(Array.isArray(data.vvpiItems) ? data.vvpiItems : []);
    } catch (err) {
      console.error("Failed to fetch VIP items:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

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
        
        xhr.open("POST", VIP_API.UPLOAD);
        xhr.send(formData);
      });
      
    } catch (error) {
      console.error("Upload failed:", error);
      errorSetter(error.message);
      throw error;
    }
  };

  // Upload frame file
  const handleFrameUpload = async (file) => {
    return handleFileUpload(file, setFrameUploadProgress, setFrameUploadError);
  };

  // Upload pic file
  const handlePicUpload = async (file) => {
    return handleFileUpload(file, setPicUploadProgress, setPicUploadError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFrameUploadError(null);
    setPicUploadError(null);
    
    try {
      let frameUrl = form.vpiframe;
      let picUrl = form.pic;

      // If there's a new frame file to upload (and it's not already a URL string)
      if (form.vpiframe && typeof form.vpiframe !== 'string') {
        frameUrl = await handleFrameUpload(form.vpiframe);
      }

      // If there's a new pic file to upload (and it's not already a URL string)
      if (form.pic && typeof form.pic !== 'string') {
        picUrl = await handlePicUpload(form.pic);
      }

      const payload = {
        ui_id: form.ui_id,
        vipTital: form.vipTital,
        vipDescription: form.vipDescription,
        vpiframe: frameUrl,
        pic: picUrl,
        bubbleChat: form.bubbleChat,
        entarneentarneShow: form.entarneentarneShow,
        price: Number(form.price),
        days: Number(form.days),
        spicelGift: form.spicelGift,
        profileheadware: form.profileheadware
      };

      const url = isEditMode ? `${VIP_API.UPDATE}/${editId}` : VIP_API.CREATE;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to submit VIP item");
      }

      // Reset form
      setForm({
        ui_id: "",
        vipTital: "",
        vipDescription: "",
        vpiframe: null,
        pic: null,
        bubbleChat: "",
        entarneentarneShow: "",
        price: "",
        days: "",
        spicelGift: "",
        profileheadware: ""
      });
      setFramePreviewUrl(null);
      setPicPreviewUrl(null);
      setIsEditMode(false);
      setShowModal(false);
      setEditId(null);

      // Refresh items list
      fetchItems();
    } catch (err) {
      const errorMessage = err.message || "An error occurred";
      alert(errorMessage);
    } finally {
      setLoading(false);
      setFrameUploadProgress(0);
      setPicUploadProgress(0);
    }
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setEditId(item._id);
    setForm({
      ui_id: item.ui_id || "",
      vipTital: item.vipTital || "",
      vipDescription: item.vipDescription || "",
      vpiframe: item.vpiframe || null,
      pic: item.pic || null,
      bubbleChat: item.bubbleChat || "",
      entarneentarneShow: item.entarneentarneShow || "",
      price: item.price || "",
      days: item.days || "",
      spicelGift: item.spicelGift || "",
      profileheadware: item.profileheadware || ""
    });
    setFramePreviewUrl(item.vpiframe || null);
    setPicPreviewUrl(item.pic || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this VIP item?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${VIP_API.DELETE}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete VIP item");
      
      fetchItems();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, isPicField = false) => {
    const file = e.target.files[0];
    if (!file) {
      if (isPicField) {
        setPicPreviewUrl(null);
        setForm({ ...form, pic: null });
      } else {
        setFramePreviewUrl(null);
        setForm({ ...form, vpiframe: null });
      }
      return;
    }
    
    if (isPicField) {
      setForm({ ...form, pic: file });
      setPicUploadError(null);
    } else {
      setForm({ ...form, vpiframe: file });
      setFrameUploadError(null);
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (isPicField) {
        setPicPreviewUrl(reader.result);
      } else {
        setFramePreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 md:p-6 bg-[#0f0f1b] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Crown className="text-yellow-400" /> VIP Management
        </h2>
        <button
          onClick={() => {
            setForm({
              ui_id: "",
              vipTital: "",
              vipDescription: "",
              vpiframe: null,
              pic: null,
              bubbleChat: "",
              entarneentarneShow: "",
              price: "",
              days: "",
              spicelGift: "",
              profileheadware: ""
            });
            setFramePreviewUrl(null);
            setPicPreviewUrl(null);
            setIsEditMode(false);
            setEditId(null);
            setShowModal(true);
            setFrameUploadError(null);
            setPicUploadError(null);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <Plus size={18} />
          Create VIP Item
        </button>
      </div>

      {/* Loader */}
      {loading && !showModal && (
        <div className="flex justify-center my-10">
          <Loader2 className="animate-spin text-white" size={36} />
        </div>
      )}

      {/* VIP Item Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <div key={item._id} className="bg-[#1a1a2e] rounded-xl shadow-lg p-4 border border-yellow-700">
            {item.pic && (
              <img
                src={item.pic}
                alt={item.vipTital}
                className="w-full h-48 object-cover rounded-lg mb-3"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/200x200/1a1a2e/ffffff?text=Image+Not+Found";
                }}
              />
            )}
            {item.vpiframe && (
              <img
                src={item.vpiframe}
                alt={`${item.vipTital} frame`}
                className="w-full h-48 object-cover rounded-lg mb-3"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/200x200/1a1a2e/ffffff?text=Frame+Not+Found";
                }}
              />
            )}
            <div>
              <h4 className="text-lg font-semibold mb-1 text-yellow-300">{item.vipTital}</h4>
              <p className="text-sm text-gray-400 mb-2">{item.vipDescription}</p>
              <p className="text-sm text-gray-400">
                💰 Price: ${item.price} | 📅 Days: {item.days}
              </p>
              <p className="text-sm text-gray-500">👤 User ID: {item.ui_id}</p>
              {item.bubbleChat && (
                <p className="text-sm text-gray-400">💬 Bubble Chat: {item.bubbleChat}</p>
              )}
              {item.entarneentarneShow && (
                <p className="text-sm text-gray-400">🎭 Entrance: {item.entarneentarneShow}</p>
              )}
              {item.spicelGift && (
                <p className="text-sm text-gray-400">🎁 Special Gift: {item.spicelGift}</p>
              )}
              {item.profileheadware && (
                <p className="text-sm text-gray-400">👒 Headwear: {item.profileheadware}</p>
              )}
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
      {!loading && items.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400">No VIP items found. Create your first VIP item!</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#121225] p-6 rounded-2xl w-full max-w-2xl relative border border-yellow-800 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowModal(false);
              }}
              className="absolute top-4 right-4 text-white hover:text-red-400"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-yellow-400">
              {isEditMode ? "Edit VIP Item" : "Create New VIP Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="User ID"
                  value={form.ui_id}
                  onChange={(e) => setForm({ ...form, ui_id: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="VIP Title"
                  value={form.vipTital}
                  onChange={(e) => setForm({ ...form, vipTital: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
              </div>
              
              <textarea
                placeholder="VIP Description"
                value={form.vipDescription}
                onChange={(e) => setForm({ ...form, vipDescription: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                rows="3"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
                <input
                  type="number"
                  placeholder="Days"
                  value={form.days}
                  onChange={(e) => setForm({ ...form, days: e.target.value })}
                  required
                  min="1"
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Bubble Chat"
                  value={form.bubbleChat}
                  onChange={(e) => setForm({ ...form, bubbleChat: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Entrance Show"
                  value={form.entarneentarneShow}
                  onChange={(e) => setForm({ ...form, entarneentarneShow: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Special Gift"
                  value={form.spicelGift}
                  onChange={(e) => setForm({ ...form, spicelGift: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
                <input
                  type="text"
                  placeholder="Profile Headwear"
                  value={form.profileheadware}
                  onChange={(e) => setForm({ ...form, profileheadware: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
              </div>
              
              {/* Frame Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  VIP Frame
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, false)}
                  className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                />
                {frameUploadProgress > 0 && frameUploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-600 h-2.5 rounded-full" 
                        style={{ width: `${frameUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uploading: {Math.round(frameUploadProgress)}%</p>
                  </div>
                )}
                {frameUploadError && (
                  <p className="text-red-400 text-xs mt-1">{frameUploadError}</p>
                )}
              </div>
              
              {/* Picture Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  VIP Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, true)}
                  className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                />
                {picUploadProgress > 0 && picUploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-600 h-2.5 rounded-full" 
                        style={{ width: `${picUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uploading: {Math.round(picUploadProgress)}%</p>
                  </div>
                )}
                {picUploadError && (
                  <p className="text-red-400 text-xs mt-1">{picUploadError}</p>
                )}
              </div>
              
              {/* Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {framePreviewUrl ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Frame Preview:</p>
                    <img
                      src={framePreviewUrl}
                      alt="Frame Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ) : form.vpiframe && typeof form.vpiframe === 'string' ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Current Frame:</p>
                    <img
                      src={form.vpiframe}
                      alt="Current Frame"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ) : null}
                
                {picPreviewUrl ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Picture Preview:</p>
                    <img
                      src={picPreviewUrl}
                      alt="Picture Preview"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ) : form.pic && typeof form.pic === 'string' ? (
                  <div>
                    <p className="text-sm text-gray-300 mb-1">Current Picture:</p>
                    <img
                      src={form.pic}
                      alt="Current Picture"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                ) : null}
              </div>
              
              <button
                type="submit"
                disabled={loading || (frameUploadProgress > 0 && frameUploadProgress < 100) || (picUploadProgress > 0 && picUploadProgress < 100)}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 py-2 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : isEditMode ? (
                  "Update VIP Item"
                ) : (
                  "Create VIP Item"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}