import { motion } from "framer-motion";
import HeaderBar from "../components/HeaderBar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#281B13] text-[#F3E2D4]">
      <HeaderBar />

      <main className="flex flex-col md:flex-row gap-10 items-start justify-center px-6 sm:px-12 py-16 flex-1 max-w-6xl mx-auto">
        <motion.img
          src="/about.jpg"
          alt="Tangled film reel"
          className="w-full md:w-[500px] max-h-[620px] rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.32)] object-cover"
          whileHover={{ scale: 1.015 }}
          transition={{ duration: 0.4 }}
        />

        <motion.div
          className="max-w-xl pt-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <p className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-[#FC7023]/80">
            Portfolio case study
          </p>
          <h2 className="text-3xl sm:text-4xl font-black leading-tight text-[#FC7023] mb-6">
            Why ReelFeel exists
          </h2>

          <p className="mb-4 leading-relaxed">
            ReelFeel started from a simple movie habit: logging what I watched
            was useful, but the interesting question was why certain films stayed
            with me. The product treats reviews, moods, ratings, and saved titles
            as taste signals instead of just collection metadata.
          </p>

          <p className="mb-4 leading-relaxed">
            Most recommendation tools begin with the film: genre, popularity,
            public rating, or “similar title” matching. ReelFeel begins with the
            viewer. It builds a compact taste profile, retrieves real candidates
            from TMDB, then uses a low-cost LLM pass only where it adds value:
            reranking Mood recommendations and explaining the match.
          </p>

          <p className="mb-4 leading-relaxed">
            Title search is intentionally more transparent. It returns the exact
            movie result first and, when taste memory exists, shows a heuristic
            fit estimate based on visible metadata overlap. That keeps the app
            honest about when AI reasoning is being used and when it is not.
          </p>

          <p className="mb-4 leading-relaxed">
            The live demo uses a curated read-only account so reviewers can see
            the complete loop immediately: taste memory, dashboard evidence,
            Mood recommendation, explanation, and read-only safeguards.
          </p>

          <p className="mb-4 leading-relaxed">
            I built ReelFeel as a deployed portfolio product, with a FastAPI
            backend, React/Vite frontend, Neon Postgres persistence, TMDB
            retrieval, OpenAI reranking, and production health checks.
          </p>

          <p className="mt-6 border-l-2 border-[#FC7023] pl-4 text-sm italic text-[#F3E2D4]/78">
            The name <span className="font-semibold">ReelFeel</span> comes from
            film reels: tangled, imperfect, full of light and shadow. Like
            the stories that stay with us.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
