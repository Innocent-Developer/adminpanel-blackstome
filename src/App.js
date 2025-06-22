import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./Compontents/Login.jsx";
import Dashboard from "./Files/Dashboard.jsx";
import Users from "./Files/Users.jsx";
import WithdrawsRequest from "./Files/Withdraws/Request.jsx";
import WithdrawApproval from "./Files/Withdraws/ApproveWithdraws.jsx";
import AllFeedback from "./Files/FeedBack.jsx";
import AllBanners from "./Files/AllBaners.jsx";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  return (
    <Router>
  
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/" />
          }
        />
        <Route
          path="/users"
          element={
            isAuthenticated ? <Users /> : <Navigate to="/" />
          }
        />
        <Route
          path="/withdraws/requests"
          element={
            isAuthenticated ? <WithdrawsRequest /> : <Navigate to="/" />
          }
        />
        <Route
          path="/Approve-withdraw"
          element={
            isAuthenticated ? <WithdrawApproval /> : <Navigate to="/" />
          }
        />
        <Route
          path="/feedback"
          element={
            isAuthenticated ? <AllFeedback /> : <Navigate to="/" />
          }
        />
        <Route
          path="/Banner"
          element={
            isAuthenticated ? <AllBanners /> : <Navigate to="/" />
          }
        />
        <Route
          path="*"
          element={<Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
