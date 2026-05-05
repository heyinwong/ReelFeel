import { motion } from "framer-motion";

function ChipList({ items = [], empty = "Still learning" }) {
  if (!items || items.length === 0) {
    return <span className="text-[#F3E2D4]/50 text-sm">{empty}</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="text-xs px-2.5 py-1 rounded-full bg-[#FC7023]/15 border border-[#FC7023]/35 text-[#F3E2D4]"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function TasteProfilePanel({ profile }) {
  if (!profile) return null;

  const axes = Object.entries(profile.preference_axes || {});
  const confidence = profile.confidence || "low";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto mt-8 text-left"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="text-xl font-semibold text-[#FC7023]">Taste Profile</h2>
        <span className="text-xs uppercase tracking-wide px-3 py-1 rounded-full border border-[#FC7023]/40 text-[#F3E2D4]/80">
          Confidence: {confidence}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-[#FC7023]/25 bg-[#281B13]/70 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#F3E2D4] mb-3">
            Preference Axes
          </h3>
          {axes.length === 0 ? (
            <p className="text-sm text-[#F3E2D4]/50">Still learning</p>
          ) : (
            <div className="space-y-2">
              {axes.map(([name, value]) => (
                <div key={name} className="text-sm">
                  <span className="text-[#FC7023] capitalize">
                    {name.replaceAll("_", " ")}:
                  </span>{" "}
                  <span className="text-[#F3E2D4]/85">{value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-[#FC7023]/25 bg-[#281B13]/70 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#F3E2D4] mb-3">
            AI Taste Signals
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase text-[#FC7023]/80 mb-2">
                Leaning Toward
              </p>
              <ChipList items={profile.liked_patterns} />
            </div>
            <div>
              <p className="text-xs uppercase text-[#FC7023]/80 mb-2">
                Avoiding
              </p>
              <ChipList items={profile.disliked_patterns} />
            </div>
          </div>
        </div>

        <div className="border border-[#FC7023]/25 bg-[#281B13]/70 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#F3E2D4] mb-3">
            Recurring Genres
          </h3>
          <ChipList items={profile.favorite_genres} empty="No recurring genre signals yet" />
        </div>

        <div className="border border-[#FC7023]/25 bg-[#281B13]/70 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-[#F3E2D4] mb-3">
            Directors & Eras
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase text-[#FC7023]/80">
                Directors
              </p>
              <ChipList items={profile.favorite_directors} empty="No director signal yet" />
            </div>
            <div>
              <p className="mb-2 text-xs uppercase text-[#FC7023]/80">
                Eras
              </p>
              <ChipList items={profile.favorite_eras} empty="No era signal yet" />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export default TasteProfilePanel;
