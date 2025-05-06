function MovieCard({ title, poster, rating, onDelete, onClick }) {
  const movie = { title, poster, rating };

  return (
    <div
      onClick={() => onClick && onClick(movie)}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition w-48 cursor-pointer flex flex-col relative"
    >
      <img src={poster} alt={title} className="w-full h-72 object-cover" />
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm mb-1 truncate">{title}</h3>
          <p className="text-xs text-gray-500">⭐ {rating ?? "N/A"}</p>
        </div>
      </div>

      {onDelete && (
        <div className="px-3 pb-3">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent modal trigger
              onDelete(movie);
            }}
            className="w-full bg-red-500 text-white text-sm py-1 rounded hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default MovieCard;
