import { Lock, Sparkles } from "lucide-react";

function CollectionHero({ title, eyebrow, description, count, user, accent = "taste memories" }) {
  return (
    <section className="mb-7 flex flex-col gap-4 text-[#F3E2D4] sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="mb-2 text-xs font-black uppercase tracking-[0.26em] text-[#FC7023]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-black leading-tight sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#F3E2D4]/78 sm:text-base">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 sm:justify-end">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#F3E2D4]/15 bg-black/25 px-4 py-2 text-sm font-bold backdrop-blur">
          <Sparkles size={16} className="text-[#FC7023]" />
          {count} {accent}
        </span>
        {user?.is_demo && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FC7023]/35 bg-[#FC7023]/12 px-4 py-2 text-sm font-bold text-[#F3E2D4] backdrop-blur">
            <Lock size={15} className="text-[#FC7023]" />
            Demo is view-only
          </span>
        )}
      </div>
    </section>
  );
}

export default CollectionHero;
