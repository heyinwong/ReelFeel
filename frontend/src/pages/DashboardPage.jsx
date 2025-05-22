import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 你漏了这行
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import HeaderBar from "../components/HeaderBar";

function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const [summary, setSummary] = useState("");
  const [snapshots, setSnapshots] = useState([]);
  const navigate = useNavigate(); // ✅ 你用了 navigate 却没定义

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      API.get("/taste-summary")
        .then((res) => setSummary(res.data.summary || ""))
        .catch((err) => console.error("Error fetching summary:", err));

      API.get("/snapshot-history")
        .then((res) => setSnapshots(res.data.snapshots || []))
        .catch((err) => console.error("Error fetching snapshots:", err));
    }
  }, [isLoading, user, navigate]); // ✅ 全部依赖写上

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <HeaderBar username={user?.username} onLogout={logout} />
      <main className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">🎞️ Your Taste Dashboard</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">🧠 Current AI Summary</h2>
          <div className="bg-white rounded shadow p-5 text-gray-700 text-base">
            {summary ? (
              <p className="italic">"{summary.replace(/^The user/, "You")}"</p>
            ) : (
              <p className="text-gray-400">No summary available.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-4">📜 Recent Snapshots</h2>
          {snapshots.length === 0 ? (
            <p className="text-gray-500">No snapshots yet.</p>
          ) : (
            <ul className="space-y-4">
              {snapshots.map((s, i) => (
                <li key={i} className="bg-white border rounded p-4 shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(s.timestamp).toLocaleString()}
                  </div>
                  <div>{s.comment.replace(/^The user/, "You")}</div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
