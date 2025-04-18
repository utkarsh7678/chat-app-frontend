import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/socketContext"; // Import SocketProvider
import Dashboard from "./components/Dashboard";
import Chat from "./components/chat";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./pages/Home";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  return (
    <Router>
    <SocketProvider> {/* Wrap the Router with SocketProvider */}
   
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} /> {/* Add this */}
      </Routes>
    </SocketProvider>
    </Router>
  );
}

export default App;


