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
import ProtectedLayout from "./Compontents/ProtectedLayout.jsx"; // Adjust path if needed
import SetCoinPrice from "./Files/CoinPrice.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

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

        {/* Authenticated Routes wrapped with Sidebar */}
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

        {/* Redirect all other paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
