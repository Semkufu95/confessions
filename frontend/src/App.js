import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ConfessionPage from "./pages/ConfessionPage";
import Navbar from "./components/Navbar";

function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <div className="p-4 max-w-2xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/confessions/:id" element={<ConfessionPage />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;
