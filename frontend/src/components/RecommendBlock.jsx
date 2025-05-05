function RecommendBlock({ mood }) {
  if (!mood) return null;

  // 未来这里会放调用 API 的逻辑
  return (
    <div className="mt-8 w-full max-w-2xl bg-white shadow-lg rounded-xl p-6">
      <h3 className="text-lg font-semibold mb-2">Recommended Movies for:</h3>
      <p className="italic text-blue-600 mb-4">"{mood}"</p>

      {/* 暂时是模拟结果 */}
      <ul className="list-disc pl-5 text-gray-700">
        <li>The Secret Life of Walter Mitty</li>
        <li>Midnight in Paris</li>
        <li>Inside Out</li>
      </ul>
    </div>
  );
}

export default RecommendBlock;
