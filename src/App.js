import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Login from "./Compontents/Login.jsx";
import Dashboard from "./Files/Dashboard.jsx";
import Users from "./Files/Users.jsx";
import WithdrawsRequest from "./Files/Withdraws/Request.jsx";
import WithdrawApproval from "./Files/Withdraws/ApproveWithdraws.jsx";
import AllFeedback from "./Files/FeedBack.jsx";
import AllBanners from "./Files/AllBaners.jsx";
import ProtectedLayout from "./Compontents/ProtectedLayout.jsx";
import SetCoinPrice from "./Files/CoinPrice.jsx";
import AdminMessage from "./Files/OfficalMassege.jsx";
import AllPosts from "./Files/AllPosts.jsx";
import AgencyRequest from "./Files/agencyRequest.jsx";
import AllMerchants from "./Files/Merchants.jsx";
import CoinRequests from "./Files/MerchantBuyCoin.jsx";
import RoomsPage from "./Files/Rooms.jsx";
import ShopAdminPage from "./Files/ShopPage.jsx";
import RoomBackGroundRequest from "./Files/RoomBackGroundRequest.jsx";
import GiftAdminPage from "./Files/Gifts.jsx";
import Vvips from "./Files/Vvips.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null to delay rendering
  const inactivityTimerRef = useRef(null);
  const INACTIVITY_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

  const logout = () => {
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("lastActivity");
    } catch (e) {
      // noop
    }
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    const lastActivityStr = localStorage.getItem("lastActivity");
    const lastActivity = lastActivityStr ? Number(lastActivityStr) : Date.now();

    if (Date.now() - lastActivity > INACTIVITY_LIMIT_MS) {
      logout();
      return;
    }

    // Ensure we have a baseline lastActivity
    localStorage.setItem("lastActivity", String(Date.now()));
    setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    const resetInactivityTimer = () => {
      localStorage.setItem("lastActivity", String(Date.now()));
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_LIMIT_MS);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "visibilitychange",
    ];

    events.forEach((event) => window.addEventListener(event, resetInactivityTimer));

    // Start timer immediately on auth
    resetInactivityTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetInactivityTimer));
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [isAuthenticated]);

  // Show loading until auth is checked
  if (isAuthenticated === null) {
    return <div className="text-white p-4">Checking authentication...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login setIsAuthenticated={setIsAuthenticated} />
            )
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <Users />
            </ProtectedLayout>
          }
        />
        <Route
          path="/withdraws/requests"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <WithdrawsRequest />
            </ProtectedLayout>
          }
        />
        <Route
          path="/Approve-withdraw"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <WithdrawApproval />
            </ProtectedLayout>
          }
        />
        <Route
          path="/feedback"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <AllFeedback />
            </ProtectedLayout>
          }
        />
        <Route
          path="/Banner"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <AllBanners />
            </ProtectedLayout>
          }
        />
        <Route
          path="/coin-price"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <SetCoinPrice />
            </ProtectedLayout>
          }
        />
        <Route
          path="/admin-massege"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <AdminMessage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/posts"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <AllPosts />
            </ProtectedLayout>
          }
        />
        <Route
          path="/agency-system"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <AgencyRequest />
            </ProtectedLayout>
          }
        />
        <Route
          path="/merchants"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <AllMerchants />
            </ProtectedLayout>
          }
        />
        <Route
          path="/room"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <RoomsPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/merchantscoins"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <CoinRequests />
            </ProtectedLayout>
          }
        />

        <Route
          path="/shop"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <ShopAdminPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/room/background"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <RoomBackGroundRequest />
            </ProtectedLayout>
          }
        />
        <Route
          path="/gifts"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <GiftAdminPage />
            </ProtectedLayout>
          }
        />
        <Route
          path="/vvips"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <Vvips />
            </ProtectedLayout>
          }
        />
        {/* Redirect unmatched paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
