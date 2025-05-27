function MovieFilterBar({
  sortOption,
  setSortOption,
  filterOption,
  setFilterOption,
  sortOptions = [],
  filterOptions = [],
  hideFilter = false, // 新增：控制是否显示右侧筛选器
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6 px-2">
      {/* 排序下拉框 */}
      <select
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
        className="bg-[#281B13]/90 text-[#F3E2D4] border border-[#FC7023]/40 rounded-lg px-4 py-2 text-sm shadow-sm hover:border-[#FC7023] focus:outline-none focus:ring-2 focus:ring-[#FC7023]/50 transition-all"
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* 条件筛选下拉框（可隐藏） */}
      {!hideFilter && (
        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          className="bg-[#281B13]/90 text-[#F3E2D4] border border-[#FC7023]/40 rounded-lg px-4 py-2 text-sm shadow-sm hover:border-[#FC7023] focus:outline-none focus:ring-2 focus:ring-[#FC7023]/50 transition-all"
        >
          {filterOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export default MovieFilterBar;
