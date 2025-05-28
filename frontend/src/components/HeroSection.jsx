import { motion } from "framer-motion";

const textVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.3, duration: 1 },
  }),
};

function HeroSection({
  title,
  subtitle1,
  subtitle2,
  imageSrc = "/hero.jpg",
  height = "h-[400px] sm:h-[500px]", // ✅ 默认高度
}) {
  return (
    <div className={`relative w-full ${height} overflow-hidden text-[#FDF4E3]`}>
      {/* 背景图片 */}
      <img
        src={imageSrc}
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover object-right"
      />

      {/* 渐变遮罩过渡到底色 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#281B13]/95"></div>

      {/* 正文区域（文字 + 动画） */}
      <div className="relative z-10 px-6 sm:px-10 mt-24 sm:mt-32 max-w-2xl mx-auto text-center">
        <motion.h1
          className="text-3xl sm:text-5xl font-bold mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
          variants={textVariants}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          {title}
        </motion.h1>

        {subtitle1 && (
          <motion.p
            className="text-base sm:text-lg mb-2 font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            {subtitle1}
          </motion.p>
        )}

        {subtitle2 && (
          <motion.p
            className="text-base sm:text-lg font-normal drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            {subtitle2}
          </motion.p>
        )}
      </div>

      {/* 底部渐变遮罩过渡区域 */}
      <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-b from-transparent to-[#281B13] z-10 pointer-events-none" />
    </div>
  );
}

export default HeroSection;
