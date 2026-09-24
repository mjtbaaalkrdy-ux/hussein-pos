import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "./store/auth";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Inventory from "./pages/Inventory";
import Materials from "./pages/Materials";
import Purchases from "./pages/Purchases";
import Users from "./pages/Users";
import Debts from "./pages/Debts";

export default function App() {
  const user = useAuth((s) => s.user);

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      <Route path="/dashboard" element={<ProtectedRoute roles={["admin", "assistant", "accountant", "supervisor", "picker"]}><Layout><Dashboard /></Layout></ProtectedRoute>} />
      <Route path="/pos" element={<ProtectedRoute roles={["admin", "assistant", "accountant"]}><Layout><POS /></Layout></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute roles={["admin", "assistant", "accountant", "supervisor", "picker"]}><Layout><Orders /></Layout></ProtectedRoute>} />
      <Route path="/orders/:id" element={<ProtectedRoute roles={["admin", "assistant", "accountant", "supervisor", "picker"]}><Layout><OrderDetails /></Layout></ProtectedRoute>} />
      <Route path="/inventory" element={<ProtectedRoute roles={["admin", "assistant"]}><Layout><Inventory /></Layout></ProtectedRoute>} />
      <Route path="/materials" element={<ProtectedRoute roles={["admin", "assistant"]}><Layout><Materials /></Layout></ProtectedRoute>} />
      <Route path="/purchases" element={<ProtectedRoute roles={["admin", "assistant"]}><Layout><Purchases /></Layout></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={["admin", "assistant"]}><Layout><Users /></Layout></ProtectedRoute>} />
      <Route path="/debts" element={<ProtectedRoute roles={["admin", "assistant", "accountant"]}><Layout><Debts /></Layout></ProtectedRoute>} />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}