import GenrePieChart from "./charts/GenrePieChart";
import DirectorBarChart from "./charts/DirectorBarChart";
import YearBarChart from "./charts/YearBarChart";

function TasteCharts({ watched }) {
  if (!watched || watched.length === 0) {
    return (
      <p className="text-[#F3E2D4]/60">No watched movie data available.</p>
    );
  }

  return (
    <section className="w-full mt-8">
      <h2 className="text-[#F3E2D4] text-xl font-bold mb-4">
        Your Viewing Patterns
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <GenrePieChart watched={watched} />
        <DirectorBarChart watched={watched} />
        <YearBarChart watched={watched} />
      </div>
    </section>
  );
}

export default TasteCharts;
