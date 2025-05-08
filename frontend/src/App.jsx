import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import MainPage from "./pages/MainPage";
import WatchedListPage from "./pages/WatchedListPage";
import WaitingListPage from "./pages/WaitingListPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />{" "}
      {/* ✅ 添加这一行 */}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/watched" element={<WatchedListPage />} />
        <Route path="/waiting" element={<WaitingListPage />} />
      </Routes>
    </Router>
  );
}

export default App;
