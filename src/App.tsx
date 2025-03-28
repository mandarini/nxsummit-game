import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import TicketPage from "./pages/TicketPage";
import IdentifyPage from "./pages/IdentifyPage";
import ScanPage from "./pages/ScanPage";
import AdminPage from "./pages/AdminPage";
import CheckInPage from "./pages/CheckInPage";
import StaffRoute from "./components/StaffRoute";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <Routes>
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/identify" element={<IdentifyPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route
            path="/admin"
            element={
              <StaffRoute>
                <AdminPage />
              </StaffRoute>
            }
          />
          <Route
            path="/checkin"
            element={
              <StaffRoute>
                <CheckInPage />
              </StaffRoute>
            }
          />
          <Route path="/" element={<Navigate to="/identify" replace />} />
        </Routes>
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
}

export default App;
