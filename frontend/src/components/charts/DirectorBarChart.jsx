import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function DirectorBarChart({ watched }) {
  const directorCounts = {};
  watched.forEach((movie) => {
    const name = movie.director?.trim();
    if (name) {
      directorCounts[name] = (directorCounts[name] || 0) + 1;
    }
  });

  const data = Object.entries(directorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // 只显示前 5 名导演

  return (
    <div className="bg-[#281B13] rounded-2xl p-4 shadow-xl w-full h-80">
      <h3 className="text-[#F3E2D4] text-lg font-semibold mb-2">
        Favorite Directors
      </h3>
      {data.length === 0 ? (
        <p className="text-[#F3E2D4]/60">No director data.</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 30 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#FC7023"
              opacity={0.2}
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#F3E2D4", fontSize: 12 }}
              angle={-15}
              textAnchor="end"
              interval={0}
            />
            <YAxis
              tick={{ fill: "#F3E2D4", fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip wrapperClassName="!bg-[#F3E2D4] !text-[#281B13] text-sm" />
            <Bar dataKey="count" fill="#FC7023" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default DirectorBarChart;
