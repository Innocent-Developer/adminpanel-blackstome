import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null to delay rendering

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

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
          path="/merchantscoin"
          element={
            <ProtectedLayout isAuthenticated={isAuthenticated}>
              <CoinRequests />
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
