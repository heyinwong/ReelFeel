import { motion } from "framer-motion";
import HeaderBar from "../components/HeaderBar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#281B13] text-[#F3E2D4]">
      <HeaderBar />

      <main className="flex flex-col md:flex-row gap-8 items-start justify-center px-6 sm:px-12 py-16 flex-1 max-w-6xl mx-auto">
        {/* 图片 + hover 动效 */}
        <motion.img
          src="/about.jpg"
          alt="Tangled film reel"
          className="w-full md:w-[520px] max-h-[620px] rounded-xl shadow-lg object-cover"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.4 }}
        />

        {/* 右侧正文 + 淡入动画 */}
        <motion.div
          className="max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-bold text-[#FC7023] mb-6">
            Why ReelFeel?
          </h2>

          <p className="mb-4 leading-relaxed">
            I love watching films, not just for entertainment but because it
            makes me feel connected. Like many others who love movies, I’m often
            searching for something that resonates with me — a quiet emotion, a
            lingering scene, a mood that reflects something inside.
          </p>

          <p className="mb-4 leading-relaxed">
            I started logging films I watched not simply to remember what I saw,
            but to understand why certain stories moved me. Through that
            process, I hoped to understand myself a little better as well.
          </p>

          <p className="mb-4 leading-relaxed">
            Most tools available focus on sorting movies by genre, public
            rating, or popularity. But I’ve always felt that recommendations
            should begin with the viewer, not the film. What if the way people
            watch, rate, like, and comment could guide what they discover next?
          </p>

          <p className="mb-4 leading-relaxed">
            That idea led me to taste modeling. I believe AI can help us build
            systems that respond to how we feel. Instead of suggesting similar
            titles, it can learn from our responses and offer something that
            feels more personal.
          </p>

          <p className="mb-4 leading-relaxed">
            I’m not a professional developer. I just really love films. So I
            gradually built this space, piece by piece, hoping it might connect
            with someone else in the same way films have connected with me.
          </p>

          <p className="italic text-sm text-[#F3E2D4]/80 mt-6">
            The name <span className="font-semibold">ReelFeel</span> comes from
            film reels — tangled, imperfect, full of light and shadow. Just like
            the stories that stay with us.
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
