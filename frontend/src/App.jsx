import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import MainPage from "./pages/MainPage";
import WatchedListPage from "./pages/WatchedListPage";
import WaitingListPage from "./pages/WaitingListPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/watched" element={<WatchedListPage />} />
        <Route path="/waiting" element={<WaitingListPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
