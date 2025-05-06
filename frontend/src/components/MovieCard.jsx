function MovieCard({ title, poster, rating }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition w-48">
      <img src={poster} alt={title} className="w-full h-72 object-cover" />
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1 truncate">{title}</h3>
        <p className="text-xs text-gray-500">⭐ {rating}</p>
      </div>
    </div>
  );
}

export default MovieCard;
