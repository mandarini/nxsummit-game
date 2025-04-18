import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import TicketPage from "./pages/TicketPage";
import IdentifyPage from "./pages/IdentifyPage";
import ScanPage from "./pages/ScanPage";
import AdminPage from "./pages/AdminPage";
import CheckInPage from "./pages/CheckInPage";
import RafflePage from "./pages/RafflePage";
import RulesPage from "./pages/RulesPage";
import InfoPage from "./pages/InfoPage";
import LinksPage from "./pages/LinksPage";
import StaffRoute from "./components/StaffRoute";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600">
        <Routes>
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/identify" element={<IdentifyPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/rules" element={<RulesPage />} />
          <Route path="/info" element={<InfoPage />} />
          <Route path="/links" element={<LinksPage />} />
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
          <Route
            path="/raffle"
            element={
              <StaffRoute>
                <RafflePage />
              </StaffRoute>
            }
          />
          <Route path="/" element={<Navigate to="/identify" replace />} />
        </Routes>
        <Footer />
        <Toaster position="top-center" />
      </div>
    </BrowserRouter>
  );
}

export default App;
