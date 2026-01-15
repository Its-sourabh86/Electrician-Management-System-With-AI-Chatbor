
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import UserRegister from "./pages/UserRegister";
import ElectricianRegister from "./pages/ElectricianRegister";
import UserDashboard from "./pages/dashboards/UserDashboard";
import ElectricianDashboard from "./pages/dashboards/ElectricianDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import { NotificationProvider } from "./context/NotificationContext";
import { ToastContainer } from "./components/Toast.jsx";
import ChatBot from "./components/ChatBot.jsx";

export default function App() {
  return (
    <NotificationProvider>
      <ToastContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/user" element={<UserRegister />} />
          <Route path="/register/electrician" element={<ElectricianRegister />} />

          {/* Protected Dashboard Routes (Add proper protection later) */}
          <Route path="/user" element={<UserDashboard />} />
          <Route path="/electrician" element={<ElectricianDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:chatId" element={<ChatPage />} />
        </Routes>
        <ChatBot />
      </BrowserRouter>
    </NotificationProvider>
  );
}