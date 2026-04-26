import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import MainPage from "./pages/MainPage";
import WatchedListPage from "./pages/WatchedListPage";
import WaitingListPage from "./pages/WaitingListPage";
import DashboardPage from "./pages/DashboardPage";
import AboutPage from "./pages/AboutPage";
import DemoEntryPage from "./pages/DemoEntryPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import { Toaster } from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/login" element={<LoginRegisterPage />} />
          <Route path="/demo" element={<DemoEntryPage />} />
          <Route
            path="/watched"
            element={
              <ProtectedRoute>
                <WatchedListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/waiting"
            element={
              <ProtectedRoute>
                <WaitingListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
