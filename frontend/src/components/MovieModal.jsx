function MovieModal({ movie, onClose }) {
  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ✕
        </button>
        <img
          src={movie.poster}
          alt={movie.title}
          className="w-full max-h-96 object-contain rounded mb-4"
        />
        <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
        <p className="text-sm text-gray-700 mb-2">⭐ {movie.rating}</p>
        <p className="text-sm text-gray-600">{movie.description}</p>
      </div>
    </div>
  );
}

export default MovieModal;
