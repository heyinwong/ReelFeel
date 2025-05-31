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
import { motion } from "framer-motion";

function DashboardPage() {
  const { user, isLoading } = useAuth();
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
    <div className="min-h-screen flex flex-col bg-[#281B13] text-[#F3E2D4] overflow-x-hidden relative">
      <HeaderBar />

      {/* 主内容区域 */}
      <div className="flex-1">
        {/* 顶部背景图 */}
        <div className="relative">
          <img
            src="/cinema-paradiso-hero.jpg"
            alt="dashboard backdrop"
            className="absolute inset-0 w-full h-[600px] object-cover object-center z-0"
          />
          <div className="absolute inset-0 h-[600px] bg-gradient-to-b from-transparent to-[#281B13] z-10"></div>

          <div className="relative z-20 max-w-4xl mx-auto text-center px-4 sm:px-6 pt-20">
            <motion.h1
              className="text-3xl sm:text-4xl font-extrabold mb-2 text-white drop-shadow-[0_3px_8px_rgba(0,0,0,0.85)]"
              initial={{ opacity: 0, scale: 1.05, filter: "blur(2px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              Your Taste Dashboard
            </motion.h1>

            <motion.p
              className="text-sm sm:text-base text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] mb-6"
              initial={{ opacity: 0, y: -6, filter: "blur(1px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              A reflection of your movie identity.
            </motion.p>

            <motion.h2
              className="text-xl font-semibold mb-3 text-[#FC7023]"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Current AI Summary
            </motion.h2>

            {!showSummary || !summary ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
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
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-4 max-w-3xl mx-auto p-4 sm:p-6 rounded-xl"
              >
                <TypingSummary text={summary.replace(/^The user/, "You")} />
                {typingDone && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-center"
                  >
                    <button
                      className="text-[#FC7023] hover:underline text-sm"
                      onClick={() => setShowUpdateModal(true)}
                    >
                      I want to update AI
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Snapshot 区域 */}
        <div className="relative z-10 w-full px-4 sm:px-6 py-12 max-w-3xl mx-auto overflow-x-hidden">
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-[#FC7023]/30 pt-6"
            >
              <SnapShotList
                snapshots={snapshots}
                onDelete={handleSnapshotDelete}
              />
            </motion.div>
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
