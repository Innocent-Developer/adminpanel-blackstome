# 🛠️ AdminPanel‑Blackstone

A powerful full-stack admin panel built with **React + Tailwind CSS** and **Node.js + Express + MongoDB**. Designed for modern platforms to manage users, shops, gifts, and more with clean UI, secure APIs, and responsive design.

---

## 🚀 Features

- 👥 Admin & User Management
- 🎁 Admin Gift System
- 🛍️ Shop Item Management (Create, Edit, Delete)
- 📤 Image Upload with Uploadcare
- 🔐 JWT Authentication & Role Protection
- 📬 Nodemailer Email Notifications
- 📊 Search, Filter & Pagination Support
- 📱 Fully Responsive UI (Tailwind CSS)

---

## 🖥️ Tech Stack

### Frontend:
- React.js
- Tailwind CSS
- Axios
- Uploadcare (for images)

### Backend:
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT for Auth
- Nodemailer for Emails

---

## 📁 Project Structure

adminpanel-blackstome/
├── client/                      # React Frontend
│   ├── public/                  # Static assets
│   └── src/   
│       ├── components/          # Reusable UI components
│       ├── pages/               # Page views (Shop, Dashboard, etc.)
│       ├── hooks/               # Custom React hooks
│       ├── utils/               # Helper functions
│       ├── App.jsx              # Main app component
│       ├── main.jsx             # Entry point
│       └── index.css            # Tailwind & global styles
│
├── server/                      # Node.js Backend
│   ├── controllers/             # Logic for routes
│   ├── models/                  # Mongoose data models
│   ├── routes/                  # Express routes
│   ├── middleware/              # Auth and error handling
│   ├── utils/                   # Helper utilities (e.g., email, upload)
│   ├── config/                  # DB connection & Uploadcare config
│   ├── .env                     # Environment variables
│   └── server.js                # Entry point for backend
│
├── .gitignore
├── README.md
└── package.json

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Innocent-Developer/adminpanel-blackstome.git
cd adminpanel-blackstome
