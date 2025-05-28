import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import HeaderBar from "../components/HeaderBar";
import SnapShotList from "../components/SnapShotList";
import TypingSummary from "../components/TypingSummary";
import UpdateSummaryModal from "../components/UpdateSummaryModal";
import Footer from "../components/Footer";
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
  const [showSnapshots, setShowSnapshots] = useState(false);
  const navigate = useNavigate();

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await API.get("/taste-summary");
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
    await Promise.all([fetchSummary(), fetchSnapshots()]);
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
    <div className="min-h-screen flex flex-col bg-[#281B13] text-[#F3E2D4]">
      <HeaderBar />

      {/* 添加 flex-1 包住中间内容 */}
      <div className="flex-1">
        <div className="relative">
          <img
            src="/cinema-paradiso-hero.jpg"
            alt="dashboard backdrop"
            className="absolute inset-0 w-full h-[600px] object-cover object-center z-0"
          />
          <div className="absolute inset-0 h-[600px] bg-gradient-to-b from-transparent to-[#281B13] z-10"></div>

          <div className="relative z-20 max-w-4xl mx-auto text-center px-6 pt-20">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Your Taste Dashboard
            </h1>
            <p className="text-sm sm:text-base text-[#F3E2D4]/90 mb-6">
              An AI-generated reflection of your movie identity.
            </p>

            <h2 className="text-xl font-semibold mb-3 text-[#FC7023]">
              Current AI Summary
            </h2>

            {!showSummary || !summary ? (
              <div>
                <button
                  className="bg-[#FC7023] hover:bg-orange-500 text-white px-4 py-2 rounded-md transition"
                  onClick={() => setShowSummary(true)}
                  disabled={!summary || summaryLoading}
                >
                  See your AI insights
                </button>
                {!summary && summaryLoading && (
                  <p className="text-sm text-gray-300 mt-2">
                    Loading insights…
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                <TypingSummary text={summary.replace(/^The user/, "You")} />
                {typingDone && (
                  <div className="text-center">
                    <button
                      className="text-[#FC7023] hover:underline text-sm"
                      onClick={() => setShowUpdateModal(true)}
                    >
                      I want to update AI
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Snapshots Section */}
        <div className="relative z-10 w-full px-6 py-12 max-w-3xl mx-auto overflow-x-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#FC7023]">
              Recent Snapshots
            </h2>
            <button
              onClick={() => setShowSnapshots(!showSnapshots)}
              className="text-[#F3E2D4] hover:text-[#FC7023] transition"
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
        </div>
      </div>

      {/* Modal + Footer */}
      {showUpdateModal && (
        <UpdateSummaryModal
          onClose={() => setShowUpdateModal(false)}
          onUpdated={refreshDashboard}
        />
      )}

      <Footer />
    </div>
  );
}

export default DashboardPage;
