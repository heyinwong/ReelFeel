import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  CheckCircle2,
  Database,
  Film,
  Route,
} from "lucide-react";
import API from "../utils/api";

const sampleProfile = {
  summary:
    "A live demo profile is ready: emotional memory, contemplative pacing, intimate sci-fi, and family-centered stories.",
  confidence: "high",
  preference_axes: {
    memory: "family, grief, alternate lives",
    pacing: "patient and reflective",
    genre_blend: "drama + sci-fi + animation",
  },
  liked_patterns: [
    "emotionally precise stories",
    "family memory and longing",
    "human-scale science fiction",
  ],
  disliked_patterns: ["cruelty without emotional meaning"],
  highlight_titles: ["Yi Yi", "Aftersun", "Arrival", "Past Lives"],
};

function TasteAgentConsole({
  user,
  loading,
  currentMovie,
  hasRecommendations,
  variant = "compact",
  className = "",
}) {
  const [profile, setProfile] = useState(sampleProfile);
  const [snapshotCount, setSnapshotCount] = useState(0);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchAgentData = useCallback(async () => {
    if (!user) {
      setProfile(sampleProfile);
      setSnapshotCount(0);
      return;
    }

    try {
      setIsProfileLoading(true);
      const [summaryRes, snapshotsRes] = await Promise.all([
        API.get("/taste-summary"),
        API.get("/snapshot-history"),
      ]);
      setProfile(summaryRes.data.profile || sampleProfile);
      setSnapshotCount(snapshotsRes.data.snapshots?.length || 0);
    } catch (err) {
      console.error("Failed to load taste agent console:", err);
    } finally {
      setIsProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAgentData();
  }, [fetchAgentData]);

  const agentSteps = useMemo(
    () => [
      { label: "Taste memory", active: Boolean(user), done: Boolean(user) },
      {
        label: "Candidate pool",
        active: loading,
        done: hasRecommendations || Boolean(currentMovie),
      },
      {
        label: user ? "Taste rerank" : "Personal context",
        active: loading && Boolean(user),
        done: Boolean(user && currentMovie?.reason),
      },
      {
        label: "Explanation",
        active: false,
        done: Boolean(user && currentMovie?.reason),
      },
    ],
    [currentMovie, hasRecommendations, loading, user]
  );

  if (variant === "side") {
    return (
      <motion.aside
        initial={{ opacity: 0, x: 18 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={`rounded-3xl border border-[#FC7023]/25 bg-[#1c120d]/82 p-5 text-[#F3E2D4] shadow-[0_20px_60px_rgba(0,0,0,0.28)] backdrop-blur-md ${className}`}
      >
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#FC7023]/35 bg-[#FC7023]/12 text-[#FC7023]">
            <BrainCircuit size={21} />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FC7023]">
              Taste Agent
            </p>
            <h3 className="text-lg font-black leading-tight">
              Why this fits
            </h3>
          </div>
        </div>

        <div className="mb-5 space-y-3">
          {agentSteps.map((step, index) => (
            <div key={step.label} className="flex items-start gap-3">
              <span
                className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                  step.done
                    ? "border-[#FC7023] bg-[#FC7023] text-[#281B13]"
                    : step.active
                      ? "border-[#FC7023]/55 bg-[#FC7023]/18 animate-pulse"
                      : "border-[#F3E2D4]/15 bg-white/5"
                }`}
              >
                {step.done ? <CheckCircle2 size={13} /> : <span className="text-[10px]">{index + 1}</span>}
              </span>
              <div>
                <div className="text-sm font-bold text-[#F3E2D4]/92">
                  {step.label}
                </div>
                <div className="text-xs leading-relaxed text-[#F3E2D4]/48">
                  {stepDescription(step.label, user)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {currentMovie ? (
          <div className="rounded-2xl border border-[#FC7023]/20 bg-black/22 p-4">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FC7023]/80">
              Current pick
            </p>
            <h4 className="mb-2 text-xl font-black">{currentMovie.title}</h4>
            <p className="text-sm leading-relaxed text-[#F3E2D4]/72">
              {user && currentMovie.reason
                ? currentMovie.reason
                : user
                  ? "Title search shows the movie first. Use Mood mode when you want taste-based reasoning."
                  : "Log in to connect recommendations to your own ratings, moods, and reviews."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(currentMovie.taste_match_tags || []).slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#FC7023]/12 px-2.5 py-1 text-xs font-semibold text-[#F3E2D4]/76"
                >
                  {tag.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#FC7023]/24 bg-black/18 p-4 text-sm leading-relaxed text-[#F3E2D4]/65">
            {isProfileLoading
              ? "Reading taste memory..."
              : "Start a recommendation to see candidate retrieval, reranking, and explanation here."}
          </div>
        )}
      </motion.aside>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={`relative z-20 mx-auto w-full max-w-4xl px-4 sm:px-6 ${className}`}
    >
      <div className="rounded-3xl border border-[#FC7023]/20 bg-[#1b120d]/72 px-5 py-4 text-[#F3E2D4] shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#FC7023]/30 bg-[#FC7023]/12 text-[#FC7023]">
              <BrainCircuit size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#FC7023]">
                Taste Memory
              </p>
              <p className="truncate text-sm leading-relaxed text-[#F3E2D4]/76 sm:text-base">
                {user
                  ? compactSummary(profile.summary)
                  : "Try the demo to see recommendations grounded in a real watch history."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Metric icon={Database} label="memories" value={user ? snapshotCount : "demo"} />
            <Metric icon={Film} label="highlights" value={(profile.highlight_titles || []).length || 4} />
            <Metric icon={Route} label="route" value={user ? "TMDB + LLM" : "sample"} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function Metric({ icon, label, value }) {
  const IconComponent = icon;
  return (
    <div className="min-w-[92px] rounded-2xl border border-[#F3E2D4]/10 bg-[#F3E2D4]/5 px-3 py-2">
      <IconComponent size={15} className="mb-1 text-[#FC7023]" />
      <div className="text-sm font-black leading-none text-[#F3E2D4]">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wide text-[#F3E2D4]/45">
        {label}
      </div>
    </div>
  );
}

function compactSummary(summary = "") {
  const firstSentence = summary.split(". ")[0];
  return firstSentence || sampleProfile.summary;
}

function stepDescription(label, user) {
  const descriptions = {
    "Taste memory": user
      ? "Uses your reviews, moods, and ratings."
      : "Guest mode has no personal history yet.",
    "Candidate pool": "Retrieves real movies from TMDB first.",
    "Taste rerank": "Ranks candidates against your profile.",
    "Personal context": "Login adds your own taste memory.",
    Explanation: "Turns the match into a short reason.",
  };
  return descriptions[label] || "";
}

export default TasteAgentConsole;
