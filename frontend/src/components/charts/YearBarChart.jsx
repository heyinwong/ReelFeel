import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function YearBarChart({ watched }) {
  const yearCounts = {};
  watched.forEach((movie) => {
    const year = movie.release_year;
    if (year && typeof year === "number") {
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  });

  const data = Object.entries(yearCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

  return (
    <div className="bg-[#281B13] rounded-2xl p-4 shadow-xl w-full h-80">
      <h3 className="text-[#F3E2D4] text-lg font-semibold mb-2">
        Release Year Trend
      </h3>
      {data.length === 0 ? (
        <p className="text-[#F3E2D4]/60">No release year data.</p>
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
              dataKey="year"
              tick={{ fill: "#F3E2D4", fontSize: 12 }}
              interval={0}
              angle={0}
              textAnchor="middle"
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

export default YearBarChart;
