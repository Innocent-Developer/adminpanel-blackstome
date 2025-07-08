// src/apiRoutes.js
const BASE_URL = "https://www.blackstonevoicechatroom.online";

export const SHOP_API = {
  CREATE: `${BASE_URL}/shop/create`,
  ITEMS: `${BASE_URL}/shop/items`,
  UPDATE: `${BASE_URL}/shop/update/item`,
  DELETE: `${BASE_URL}/shop/delete/item`,
  SEND_GIFT: `${BASE_URL}/admin/send/item`,
};

export const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/dha65z0gy/image/upload";
export const CLOUDINARY_UPLOAD_PRESET = "blackstome";
