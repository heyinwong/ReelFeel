import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderBar from "../components/HeaderBar";
import MovieCard from "../components/MovieCard";
import MovieModal from "../components/MovieModal";
function WaitingListPage() {
  const [movies, setMovies] = useState([]);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const [selectedMovie, setSelectedMovie] = useState(null);
  const handleDelete = async (movie) => {
    try {
      const res = await fetch(
        `http://localhost:8000/waiting/${encodeURIComponent(
          movie.title
        )}?username=${username}`,
        {
          method: "DELETE",
        }
      );
      if (res.ok) {
        setMovies((prev) => prev.filter((m) => m.title !== movie.title));
      } else {
        console.error("Failed to delete:", await res.text());
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };
  useEffect(() => {
    const name = localStorage.getItem("username");
    if (!name) {
      navigate("/login");
    } else {
      setUsername(name);
      fetch(`http://localhost:8000/waiting-list?username=${name}`)
        .then((res) => res.json())
        .then((data) => {
          setMovies(data.movies || []);
        })
        .catch((err) => {
          console.error("Failed to load to watch list:", err);
          setMovies([]);
        });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <HeaderBar username={username} onLogout={handleLogout} />
      <div className="px-6 py-8 max-w-screen-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Waiting List</h1>
        {movies.length === 0 ? (
          <p className="text-gray-500">Your waiting list is empty.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {movies.map((movie, index) => (
              <MovieCard
                key={index}
                {...movie}
                onDelete={handleDelete}
                onClick={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        )}
      </div>
      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}

export default WaitingListPage;
