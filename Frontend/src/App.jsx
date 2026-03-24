import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import PlateStock from "./pages/PlateStock";
import Rentals from "./pages/Rentals";
import Messages from "./pages/Message.jsx";
import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./hooks/useAuth";

function App() {
  // ✅ Single source of truth for authentication
  useAuth();

  return (
    <BrowserRouter>
      <Navbar />

      <div className="min-h-screen pt-24 px-4 md:px-10 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
        <Routes>
          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/plates"
            element={
              <ProtectedRoute>
                <PlateStock />
              </ProtectedRoute>
            }
          />

          <Route
            path="/rentals"
            element={
              <ProtectedRoute>
                <Rentals />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
