import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#FC7023", "#F3E2D4", "#b85e2e", "#a84600", "#ffd8b1"];

function GenrePieChart({ watched }) {
  // 聚合所有 genres（逗号分隔或数组）为扁平 list
  const genreCounts = {};
  watched.forEach((movie) => {
    const genres = Array.isArray(movie.genres)
      ? movie.genres
      : (movie.genres || "").split(",").map((g) => g.trim());
    genres.forEach((genre) => {
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });
  });

  const data = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-[#281B13] rounded-2xl p-4 shadow-xl w-full h-80">
      <h3 className="text-[#F3E2D4] text-lg font-semibold mb-2">Top Genres</h3>
      {data.length === 0 ? (
        <p className="text-[#F3E2D4]/60">No genre data.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              innerRadius={30}
              fill="#FC7023"
              label={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip wrapperClassName="!bg-[#F3E2D4] !text-[#281B13] text-sm" />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ color: "#F3E2D4" }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default GenrePieChart;
