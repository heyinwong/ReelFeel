import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import HeaderBar from "../components/HeaderBar";
import SnapShotList from "../components/SnapShotList";
import TypingSummary from "../components/TypingSummary";
import UpdateSummaryModal from "../components/UpdateSummaryModal";
import toast from "react-hot-toast";
import { ChevronUp, ChevronDown } from "lucide-react";
function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [summary, setSummary] = useState("");
  const [snapshots, setSnapshots] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const navigate = useNavigate();
  const [showSnapshots, setShowSnapshots] = useState(true);
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await API.get("/taste-summary");
      const fetched = res.data.summary || "";
      setSummary(fetched);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchSnapshots = async () => {
    try {
      const res = await API.get("/snapshot-history");
      setSnapshots(res.data.snapshots || []);
    } catch (err) {
      console.error("Error fetching snapshots:", err);
    }
  };

  const refreshDashboard = async () => {
    await fetchSummary();
    await fetchSnapshots();
  };

  useEffect(() => {
    if (!isLoading && user) {
      refreshDashboard();
    } else if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (summary && !typingDone) {
      setTypingDone(true);
    }
  }, [summary, typingDone]);

  const handleSnapshotDelete = async (snapshot) => {
    try {
      await API.delete(`/delete_snapshot/${snapshot.id}`);
      toast.success("Snapshot deleted.");
      refreshDashboard();
    } catch (err) {
      toast.error("Failed to delete snapshot.");
      console.error(err);
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <HeaderBar username={user?.username} onLogout={logout} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Your Taste Dashboard</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Current AI Summary</h2>
          {!showSummary || !summary ? (
            <div>
              <button
                className="btn btn-primary"
                onClick={() => setShowSummary(true)}
                disabled={!summary || summaryLoading}
              >
                See your AI insights
              </button>
              {!summary && summaryLoading && (
                <p className="text-sm text-gray-500 mt-2">Loading insights…</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <TypingSummary text={summary.replace(/^The user/, "You")} />
              {typingDone && (
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => setShowUpdateModal(true)}
                >
                  I want to update AI
                </button>
              )}
            </div>
          )}
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Snapshots</h2>
            <button
              onClick={() => setShowSnapshots(!showSnapshots)}
              className="text-gray-500 hover:text-gray-800 transition"
            >
              {showSnapshots ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>

          {showSnapshots && (
            <SnapShotList
              snapshots={snapshots}
              onDelete={handleSnapshotDelete}
            />
          )}
        </section>
      </main>
      {showUpdateModal && (
        <UpdateSummaryModal
          onClose={() => setShowUpdateModal(false)}
          onUpdated={refreshDashboard}
        />
      )}
    </div>
  );
}

export default DashboardPage;

export const useDashboardRefresh = () => {
  const fetchSummary = async () => {
    try {
      const res = await API.get("/taste-summary");
      return res.data.summary || "";
    } catch {
      return "";
    }
  };

  const fetchSnapshots = async () => {
    try {
      const res = await API.get("/snapshot-history");
      return res.data.snapshots || [];
    } catch {
      return [];
    }
  };

  return { fetchSummary, fetchSnapshots };
};
