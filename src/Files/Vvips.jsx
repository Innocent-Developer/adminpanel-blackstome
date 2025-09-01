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
  const [userData, setUserData] = useState(null);
  const [form, setForm] = useState({
    ui_id: "",
    vipTital: "",
    vpiframe: null,
    pic: null,
    bubbleChat: null,
    entarneentarneShow: "",
    price: "",
    days: "",
    spicelGift: null,
    profileheadware: null
  });
  const [framePreviewUrl, setFramePreviewUrl] = useState(null);
  const [picPreviewUrl, setPicPreviewUrl] = useState(null);
  const [bubblePreviewUrl, setBubblePreviewUrl] = useState(null);
  const [giftPreviewUrl, setGiftPreviewUrl] = useState(null);
  const [headwarePreviewUrl, setHeadwarePreviewUrl] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [frameUploadProgress, setFrameUploadProgress] = useState(0);
  const [picUploadProgress, setPicUploadProgress] = useState(0);
  const [bubbleUploadProgress, setBubbleUploadProgress] = useState(0);
  const [giftUploadProgress, setGiftUploadProgress] = useState(0);
  const [headwareUploadProgress, setHeadwareUploadProgress] = useState(0);
  const [frameUploadError, setFrameUploadError] = useState(null);
  const [picUploadError, setPicUploadError] = useState(null);
  const [bubbleUploadError, setBubbleUploadError] = useState(null);
  const [giftUploadError, setGiftUploadError] = useState(null);
  const [headwareUploadError, setHeadwareUploadError] = useState(null);

  const canvasRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Get user data from localStorage
    const userDataStr = localStorage.getItem("https://admps.funchatparty.online");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        setUserData(userData);
        setForm(prev => ({ ...prev, ui_id: userData.ui_id || "" }));
      } catch (error) {
        console.error("Failed to parse user data from localStorage:", error);
      }
    }
    
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

  // Upload bubble chat file
  const handleBubbleUpload = async (file) => {
    return handleFileUpload(file, setBubbleUploadProgress, setBubbleUploadError);
  };

  // Upload special gift file
  const handleGiftUpload = async (file) => {
    return handleFileUpload(file, setGiftUploadProgress, setGiftUploadError);
  };

  // Upload headware file
  const handleHeadwareUpload = async (file) => {
    return handleFileUpload(file, setHeadwareUploadProgress, setHeadwareUploadError);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFrameUploadError(null);
    setPicUploadError(null);
    setBubbleUploadError(null);
    setGiftUploadError(null);
    setHeadwareUploadError(null);
    
    try {
      let frameUrl = form.vpiframe;
      let picUrl = form.pic;
      let bubbleUrl = form.bubbleChat;
      let giftUrl = form.spicelGift;
      let headwareUrl = form.profileheadware;

      // If there's a new frame file to upload (and it's not already a URL string)
      if (form.vpiframe && typeof form.vpiframe !== 'string') {
        frameUrl = await handleFrameUpload(form.vpiframe);
      }

      // If there's a new pic file to upload (and it's not already a URL string)
      if (form.pic && typeof form.pic !== 'string') {
        picUrl = await handlePicUpload(form.pic);
      }

      // If there's a new bubble chat file to upload (and it's not already a URL string)
      if (form.bubbleChat && typeof form.bubbleChat !== 'string') {
        bubbleUrl = await handleBubbleUpload(form.bubbleChat);
      }

      // If there's a new special gift file to upload (and it's not already a URL string)
      if (form.spicelGift && typeof form.spicelGift !== 'string') {
        giftUrl = await handleGiftUpload(form.spicelGift);
      }

      // If there's a new headware file to upload (and it's not already a URL string)
      if (form.profileheadware && typeof form.profileheadware !== 'string') {
        headwareUrl = await handleHeadwareUpload(form.profileheadware);
      }

      const payload = {
        ui_id: form.ui_id,
        vipTital: form.vipTital,
        vpiframe: frameUrl,
        pic: picUrl,
        bubbleChat: bubbleUrl,
        entarneentarneShow: form.entarneentarneShow,
        price: Number(form.price),
        days: Number(form.days),
        spicelGift: giftUrl,
        profileheadware: headwareUrl
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
        ui_id: userData?.ui_id || "",
        vipTital: "",
      
        vpiframe: null,
        pic: null,
        bubbleChat: null,
        entarneentarneShow: "",
        price: "",
        days: "",
        spicelGift: null,
        profileheadware: null
      });
      setFramePreviewUrl(null);
      setPicPreviewUrl(null);
      setBubblePreviewUrl(null);
      setGiftPreviewUrl(null);
      setHeadwarePreviewUrl(null);
      setIsEditMode(false);
      setShowModal(false);
      setEditId(null);
      if (playerRef.current?.clear) playerRef.current.clear();

      // Refresh items list
      fetchItems();
    } catch (err) {
      const errorMessage = err.message || "An error occurred";
      alert(errorMessage);
    } finally {
      setLoading(false);
      setFrameUploadProgress(0);
      setPicUploadProgress(0);
      setBubbleUploadProgress(0);
      setGiftUploadProgress(0);
      setHeadwareUploadProgress(0);
    }
  };

  const handleEdit = (item) => {
    setIsEditMode(true);
    setEditId(item._id);
    setForm({
      ui_id: item.ui_id || (userData?.ui_id || ""),
      vipTital: item.vipTital || "",
      vpiframe: item.vpiframe || null,
      pic: item.pic || null,
      bubbleChat: item.bubbleChat || null,
      entarneentarneShow: item.entarneentarneShow || "",
      price: item.price || "",
      days: item.days || "",
      spicelGift: item.spicelGift || null,
      profileheadware: item.profileheadware || null
    });
    setFramePreviewUrl(item.vpiframe || null);
    setPicPreviewUrl(item.pic || null);
    setBubblePreviewUrl(item.bubbleChat || null);
    setGiftPreviewUrl(item.spicelGift || null);
    setHeadwarePreviewUrl(item.profileheadware || null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this VIP item?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${VIP_API.DELETE}/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete VIP item");
      }

      const result = await res.json();
      alert(result.message || "VIP item deleted successfully");
      
      fetchItems();
    } catch (err) {
      alert(err.message || "An error occurred while deleting the VIP item");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) {
      // Reset the specific field if no file is selected
      setForm({ ...form, [fieldName]: null });
      
      // Also reset the corresponding preview
      switch(fieldName) {
        case 'vpiframe':
          setFramePreviewUrl(null);
          break;
        case 'pic':
          setPicPreviewUrl(null);
          break;
        case 'bubbleChat':
          setBubblePreviewUrl(null);
          break;
        case 'spicelGift':
          setGiftPreviewUrl(null);
          break;
        case 'profileheadware':
          setHeadwarePreviewUrl(null);
          break;
        default:
          break;
      }
      return;
    }
    
    // Update the form with the new file
    setForm({ ...form, [fieldName]: file });
    
    // Reset the corresponding error
    switch(fieldName) {
      case 'vpiframe':
        setFrameUploadError(null);
        break;
      case 'pic':
        setPicUploadError(null);
        break;
      case 'bubbleChat':
        setBubbleUploadError(null);
        break;
      case 'spicelGift':
        setGiftUploadError(null);
        break;
      case 'profileheadware':
        setHeadwareUploadError(null);
        break;
      default:
        break;
    }

    const isSVGA = file.name?.toLowerCase().endsWith(".svga");

    const reader = new FileReader();
    reader.onload = () => {
      if (isSVGA) {
        const arrayBuffer = reader.result;
        playSVGA(arrayBuffer, fieldName);
        
        // For SVGA files, don't set a preview URL as we'll show the canvas
        switch(fieldName) {
          case 'vpiframe':
            setFramePreviewUrl(null);
            break;
          case 'pic':
            setPicPreviewUrl(null);
            break;
          case 'bubbleChat':
            setBubblePreviewUrl(null);
            break;
          case 'spicelGift':
            setGiftPreviewUrl(null);
            break;
          case 'profileheadware':
            setHeadwarePreviewUrl(null);
            break;
          default:
            break;
        }
      } else {
        // For image files, set the preview URL
        switch(fieldName) {
          case 'vpiframe':
            setFramePreviewUrl(reader.result);
            break;
          case 'pic':
            setPicPreviewUrl(reader.result);
            break;
          case 'bubbleChat':
            setBubblePreviewUrl(reader.result);
            break;
          case 'spicelGift':
            setGiftPreviewUrl(reader.result);
            break;
          case 'profileheadware':
            setHeadwarePreviewUrl(reader.result);
            break;
          default:
            break;
        }
      }
    };

    if (isSVGA) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const playSVGA = async (arrayBuffer, fieldName) => {
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
      
      // Set error for the specific field
      switch(fieldName) {
        case 'vpiframe':
          setFrameUploadError("Failed to preview SVGA file");
          break;
        case 'pic':
          setPicUploadError("Failed to preview SVGA file");
          break;
        case 'bubbleChat':
          setBubbleUploadError("Failed to preview SVGA file");
          break;
        case 'spicelGift':
          setGiftUploadError("Failed to preview SVGA file");
          break;
        case 'profileheadware':
          setHeadwareUploadError("Failed to preview SVGA file");
          break;
        default:
          break;
      }
    }
  };

  // Function to determine which canvas to show based on field name
  const renderCanvasPreview = (fieldName) => {
    const file = form[fieldName];
    if (file && file.name && file.name.toLowerCase().endsWith(".svga")) {
      return (
        <div>
          <p className="text-sm text-gray-300 mb-1">
            {fieldName === 'vpiframe' ? 'Frame Preview:' :
             fieldName === 'bubbleChat' ? 'Bubble Chat Preview:' :
             fieldName === 'spicelGift' ? 'Special Gift Preview:' :
             fieldName === 'profileheadware' ? 'Headware Preview:' : 'Preview:'}
          </p>
          <canvas
            ref={canvasRef}
            width="200"
            height="200"
            className="rounded-md border border-gray-600 w-full"
          />
        </div>
      );
    }
    return null;
  };

  // Function to determine which image preview to show based on field name
  const renderImagePreview = (fieldName, previewUrl, currentUrl) => {
    if (previewUrl) {
      return (
        <div>
          <p className="text-sm text-gray-300 mb-1">
            {fieldName === 'vpiframe' ? 'Frame Preview:' :
             fieldName === 'pic' ? 'Picture Preview:' :
             fieldName === 'bubbleChat' ? 'Bubble Chat Preview:' :
             fieldName === 'spicelGift' ? 'Special Gift Preview:' :
             fieldName === 'profileheadware' ? 'Headware Preview:' : 'Preview:'}
          </p>
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-40 object-cover rounded"
          />
        </div>
      );
    } else if (currentUrl && typeof currentUrl === 'string') {
      return (
        <div>
          <p className="text-sm text-gray-300 mb-1">
            [fieldName === 'vpiframe' ? 'Current Frame:' :
             fieldName === 'pic' ? 'Current Picture:' :
             fieldName === 'bubbleChat' ? 'Current Bubble Chat:' :
             fieldName === 'spicelGift' : 'Current Special Gift:' :
             fieldName === 'profileheadware' ? 'Current Headware:' : 'Current:']
          </p>
          <img
            src={currentUrl}
            alt="Current"
            className="w-full h-40 object-cover rounded"
          />
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 bg-[#0f0f1b] min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Crown className="text-yellow-400" /> VIP Management
        </h2>
        <div className="flex flex-col">
          {userData && (
            <p className="text-sm text-gray-400 mb-2">
              Logged in as: {userData.name} (ID: {userData.ui_id})
            </p>
          )}
          <button
            onClick={() => {
              setForm({
                ui_id: userData?.ui_id || "",
                vipTital: "",
                vpiframe: null,
                pic: null,
                bubbleChat: null,
                entarneentarneShow: "",
                price: "",
                days: "",
                spicelGift: null,
                profileheadware: null
              });
              setFramePreviewUrl(null);
              setPicPreviewUrl(null);
              setBubblePreviewUrl(null);
              setGiftPreviewUrl(null);
              setHeadwarePreviewUrl(null);
              setIsEditMode(false);
              setEditId(null);
              setShowModal(true);
              setFrameUploadError(null);
              setPicUploadError(null);
              setBubbleUploadError(null);
              setGiftUploadError(null);
              setHeadwareUploadError(null);
              if (playerRef.current?.clear) playerRef.current.clear();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus size={18} />
            Create VIP Item
          </button>
        </div>
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
            
              <p className="text-sm text-gray-400">
                💰 Price: ${item.price} | 📅 Days: {item.days}
              </p>
              <p className="text-sm text-gray-500">👤 User ID: {item.ui_id}</p>
              {item.bubbleChat && (
                <p className="text-sm text-gray-400">💬 Bubble Chat: Available</p>
              )}
              {item.entarneentarneShow && (
                <p className="text-sm text-gray-400">🎭 Entrance: {item.entarneentarneShow}</p>
              )}
              {item.spicelGift && (
                <p className="text-sm text-gray-400">🎁 Special Gift: Available</p>
              )}
              {item.profileheadware && (
                <p className="text-sm text-gray-400">👒 Headwear: Available</p>
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
          <div className="bg-[#121225] p-6 rounded-2xl w-full max-w-4xl relative border border-yellow-800 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => {
                setShowModal(false);
                if (playerRef.current?.clear) playerRef.current.clear();
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
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={form.ui_id}
                    onChange={(e) => setForm({ ...form, ui_id: e.target.value })}
                    required
                    className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="VIP Title"
                  value={form.vipTital}
                  onChange={(e) => setForm({ ...form, vipTital: e.target.value })}
                  required
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
              </div>
              
             
              
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
              
              <div>
                <input
                  type="text"
                  placeholder="Entrance Show"
                  value={form.entarneentarneShow}
                  onChange={(e) => setForm({ ...form, entarneentarneShow: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 p-2 rounded-lg text-white"
                />
              </div>
              
              {/* Frame Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  VIP Frame (Image or SVGA)
                </label>
                <input
                  type="file"
                  accept=".svga,image/*"
                  onChange={(e) => handleFileChange(e, 'vpiframe')}
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
                  VIP Picture (Image or SVGA)
                </label>
                <input
                  type="file"
                  accept=".svga,image/*"
                  onChange={(e) => handleFileChange(e, 'pic')}
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
              
              {/* Bubble Chat Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Bubble Chat (Image or SVGA)
                </label>
                <input
                  type="file"
                  accept=".svga,image/*"
                  onChange={(e) => handleFileChange(e, 'bubbleChat')}
                  className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                />
                {bubbleUploadProgress > 0 && bubbleUploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-600 h-2.5 rounded-full" 
                        style={{ width: `${bubbleUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uploading: {Math.round(bubbleUploadProgress)}%</p>
                  </div>
                )}
                {bubbleUploadError && (
                  <p className="text-red-400 text-xs mt-1">{bubbleUploadError}</p>
                )}
              </div>
              
              {/* Special Gift Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Special Gift (Image or SVGA)
                </label>
                <input
                  type="file"
                  accept=".svga,image/*"
                  onChange={(e) => handleFileChange(e, 'spicelGift')}
                  className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                />
                {giftUploadProgress > 0 && giftUploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-600 h-2.5 rounded-full" 
                        style={{ width: `${giftUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uploading: {Math.round(giftUploadProgress)}%</p>
                  </div>
                )}
                {giftUploadError && (
                  <p className="text-red-400 text-xs mt-1">{giftUploadError}</p>
                )}
              </div>
              
              {/* Headware Upload Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Profile Headware (Image or SVGA)
                </label>
                <input
                  type="file"
                  accept=".svga,image/*"
                  onChange={(e) => handleFileChange(e, 'profileheadware')}
                  className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-600 file:text-white hover:file:bg-yellow-700"
                />
                {headwareUploadProgress > 0 && headwareUploadProgress < 100 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-yellow-600 h-2.5 rounded-full" 
                        style={{ width: `${headwareUploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Uploading: {Math.round(headwareUploadProgress)}%</p>
                  </div>
                )}
                {headwareUploadError && (
                  <p className="text-red-400 text-xs mt-1">{headwareUploadError}</p>
                )}
              </div>
              
              {/* Previews */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Frame Preview */}
                {renderCanvasPreview('vpiframe')}
                {renderImagePreview('vpiframe', framePreviewUrl, form.vpiframe)}
                
                {/* Picture Preview */}
                {renderCanvasPreview('pic')}
                {renderImagePreview('pic', picPreviewUrl, form.pic)}
                
                {/* Bubble Chat Preview */}
                {renderCanvasPreview('bubbleChat')}
                {renderImagePreview('bubbleChat', bubblePreviewUrl, form.bubbleChat)}
                
                {/* Special Gift Preview */}
                {renderCanvasPreview('spicelGift')}
                {renderImagePreview('spicelGift', giftPreviewUrl, form.spicelGift)}
                
                {/* Headware Preview */}
                {renderCanvasPreview('profileheadware')}
                {renderImagePreview('profileheadware', headwarePreviewUrl, form.profileheadware)}
              </div>
              
              <button
                type="submit"
                disabled={loading || 
                  (frameUploadProgress > 0 && frameUploadProgress < 100) || 
                  (picUploadProgress > 0 && picUploadProgress < 100) ||
                  (bubbleUploadProgress > 0 && bubbleUploadProgress < 100) ||
                  (giftUploadProgress > 0 && giftUploadProgress < 100) ||
                  (headwareUploadProgress > 0 && headwareUploadProgress < 100)
                }
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