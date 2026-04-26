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

const emptyProfile = {
  summary: "",
  confidence: "low",
  preference_axes: {},
  liked_patterns: [],
  disliked_patterns: [],
  favorite_genres: [],
  favorite_directors: [],
  favorite_eras: [],
  highlight_titles: [],
};

function TasteAgentConsole({
  user,
  loading,
  currentMovie,
  hasRecommendations,
  variant = "compact",
  className = "",
}) {
  const [profile, setProfile] = useState(user ? emptyProfile : sampleProfile);
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
      setProfile(normalizeProfile(summaryRes.data.profile));
      setSnapshotCount(snapshotsRes.data.snapshots?.length || 0);
    } catch (err) {
      console.error("Failed to load taste agent console:", err);
      setProfile(emptyProfile);
      setSnapshotCount(0);
    } finally {
      setIsProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAgentData();
  }, [fetchAgentData]);

  const hasTasteReason = Boolean(user && currentMovie?.reason);
  const hasTasteMemory = Boolean(user && (snapshotCount > 0 || profile.summary));
  const isTitleLookup = Boolean(currentMovie && !currentMovie.reason);

  const agentSteps = useMemo(() => {
    if (isTitleLookup) {
      return [
        { label: "Title lookup", active: false, done: true },
        { label: "TMDB detail", active: false, done: true },
        { label: "Taste memory", active: false, done: hasTasteMemory },
        { label: "Mood rerank", active: false, done: false },
      ];
    }

    return [
      { label: "Taste memory", active: Boolean(user), done: hasTasteMemory },
      {
        label: "Candidate pool",
        active: loading,
        done: hasRecommendations || Boolean(currentMovie),
      },
      {
        label: user ? "Taste rerank" : "Personal context",
        active: loading && Boolean(user),
        done: hasTasteReason,
      },
      {
        label: "Explanation",
        active: false,
        done: hasTasteReason,
      },
    ];
  }, [
    currentMovie,
    hasRecommendations,
    hasTasteMemory,
    hasTasteReason,
    isTitleLookup,
    loading,
    user,
  ]);

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
              {hasTasteReason
                ? "Why this fits"
                : isTitleLookup
                  ? "Lookup details"
                  : "How it works"}
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
                  {stepDescription(step.label, user, hasTasteMemory)}
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
                  ? hasTasteMemory
                    ? "Title search returns the exact movie first. Switch to Mood when you want TMDB candidates reranked against your taste profile."
                    : "Title search returns the exact movie first. Add a few reviews, then Mood mode can rerank candidates against your taste."
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
                  ? compactSummary(profile.summary, snapshotCount)
                  : "Try the demo to see recommendations grounded in a real watch history."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Metric icon={Database} label="memories" value={user ? snapshotCount : "demo"} />
            <Metric icon={Film} label="highlights" value={highlightCount(profile, user)} />
            <Metric icon={Route} label="route" value={user ? "TMDB + LLM" : "sample"} />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function normalizeProfile(profile) {
  if (!profile || typeof profile !== "object") return emptyProfile;
  return {
    ...emptyProfile,
    ...profile,
    preference_axes: profile.preference_axes || {},
    liked_patterns: profile.liked_patterns || [],
    disliked_patterns: profile.disliked_patterns || [],
    favorite_genres: profile.favorite_genres || [],
    favorite_directors: profile.favorite_directors || [],
    favorite_eras: profile.favorite_eras || [],
    highlight_titles: profile.highlight_titles || [],
  };
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

function compactSummary(summary = "", snapshotCount = 0) {
  if (!summary.trim()) {
    return snapshotCount > 0
      ? "Your taste memory is processing recent logs into a profile."
      : "No taste memory yet. Add a film or write a review to build your profile.";
  }
  const firstSentence = summary.split(". ")[0];
  return firstSentence;
}

function highlightCount(profile, user) {
  const count = (profile.highlight_titles || []).length;
  return user ? count : count || 4;
}

function stepDescription(label, user, hasTasteMemory) {
  const descriptions = {
    "Taste memory": user
      ? hasTasteMemory
        ? "Uses your reviews, moods, and ratings."
        : "Add reviews to create a personal profile."
      : "Guest mode has no personal history yet.",
    "Candidate pool": "Retrieves real movies from TMDB first.",
    "Taste rerank": "Ranks candidates against your profile.",
    "Personal context": "Login adds your own taste memory.",
    Explanation: "Turns the match into a short reason.",
    "Title lookup": "Finds the movie you typed directly.",
    "TMDB detail": "Loads cast, score, poster, and overview.",
    "Mood rerank": "Available when you search by feeling.",
  };
  return descriptions[label] || "";
}

export default TasteAgentConsole;
