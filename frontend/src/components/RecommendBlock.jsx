function RecommendBlock({ recommendations, loading }) {
  return (
    <div className="mt-8 text-left w-full max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">
        🎬 Recommendations
      </h2>

      {loading ? (
        <p className="text-gray-500 italic">🔄 Generating recommendations...</p>
      ) : recommendations ? (
        <pre className="whitespace-pre-wrap text-gray-700 bg-white p-4 rounded shadow">
          {recommendations}
        </pre>
      ) : (
        <p className="text-gray-400 italic">No recommendations yet.</p>
      )}
    </div>
  );
}

export default RecommendBlock;
