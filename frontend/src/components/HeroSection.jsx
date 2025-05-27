function HeroSection() {
  return (
    <div
      className="w-full h-[400px] flex items-center justify-between px-10 text-[#F3E2D4]"
      style={{
        backgroundImage: "url('/banner.jpg')", // 右图背景
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold mb-4">
          Your mood-based movie companion
        </h1>
        <p className="text-lg mb-2">
          ReelFeel uses AI to understand your unique movie preferences based on
          your mood, reviews, and past likes.
        </p>
        <p className="text-lg">
          Discover films that resonate emotionally and intellectually — your
          reel, your story.
        </p>
      </div>
    </div>
  );
}

export default HeroSection;
