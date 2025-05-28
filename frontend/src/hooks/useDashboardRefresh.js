import API from "../utils/api";

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
