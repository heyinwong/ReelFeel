import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import HeaderBar from "../components/HeaderBar";
import SnapShotList from "../components/SnapShotList";
import TypingSummary from "../components/TypingSummary";
import toast from "react-hot-toast";

function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [summary, setSummary] = useState("");
  const [snapshots, setSnapshots] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await API.get("/taste-summary");
      console.log("🎯 API response:", res.data);
      setSummary(res.data.summary || "");
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
    if (!isLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      refreshDashboard();
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    console.log("✅ summary after fetch:", summary);
  }, [summary]);

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
        <h1 className="text-3xl font-bold mb-6">🎞️ Your Taste Dashboard</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">🧠 Current AI Summary</h2>
          {!showSummary || !summary ? (
            <div>
              <button
                className="btn btn-primary"
                onClick={() => setShowSummary(true)}
                disabled={!summary || summaryLoading}
              >
                📋 See your AI insights
              </button>
              {!summary && summaryLoading && (
                <p className="text-sm text-gray-500 mt-2">Loading insights…</p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <TypingSummary
                key={summary}
                text={summary.replace(/^The user/, "You")}
                onDone={() => setTypingDone(true)}
              />
              {typingDone && (
                <button className="text-blue-600 hover:underline text-sm">
                  ✏️ I want to update AI
                </button>
              )}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">📜 Recent Snapshots</h2>
          <SnapShotList snapshots={snapshots} onDelete={handleSnapshotDelete} />
        </section>
      </main>
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
