import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaArrowLeft, FaHeart } from 'react-icons/fa'; 

const YOUTUBE_API_KEY = '';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [artists, setArtists] = useState([]);
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genres, setGenres] = useState([]);
  const [genreSearchTerm, setGenreSearchTerm] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [viewingLibrary, setViewingLibrary] = useState(false);

  const allGenres = ['Pop', 'Rock', 'Salsa', 'Electronic', 'Reggaeton', 'Hip-Hop', 'Classical', 'Jazz'];

  useEffect(() => {
    fetchArtists();
    setGenres(allGenres);
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/artistsByGenre/Pop`);
      const data = await response.json();
      setArtists(data.artists);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const fetchArtistsByGenre = async (genre) => {
    try {
      const response = await fetch(`http://localhost:3001/api/artistsByGenre/${genre}`);
      const data = await response.json();
      setArtists(data.artists);
    } catch (error) {
      console.error('Error fetching artists:', error);
    }
  };

  const fetchYoutubeVideo = async (artist) => {
    try {
      const searchQuery = artist.name;
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
          searchQuery
        )}&maxResults=3&key=${YOUTUBE_API_KEY}`
      );
      const data = await response.json();

      const videos = data.items.map(item => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
      }));

      setYoutubeVideos(videos);
      setSelectedArtist(artist);
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      setYoutubeVideos(null);
    }
  };

  const handleSearch = async (event) => {
    const searchValue = event.target.value;
    setSearchTerm(searchValue);

    if (searchValue === '') {
      await fetchArtists();
    } else {
      try {
        const response = await fetch(`http://localhost:3001/api/artists/${searchValue}`);
        const data = await response.json();
        setArtists(data.artists.items);
      } catch (error) {
        console.error('Error searching artists:', error);
      }
    }
  };

  const handleGenreSearch = (event) => {
    setGenreSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
  };

  const handleBackToArtists = () => {
    setYoutubeVideos([]);
    setSelectedArtist(null);
  };

  const toggleFavorite = (artist) => {
    if (favorites.some(fav => fav.id === artist.id)) {
      setFavorites(favorites.filter(fav => fav.id !== artist.id));
    } else {
      setFavorites([...favorites, artist]);
    }
  };

  const handleViewLibrary = () => {
    setViewingLibrary(true);
  };

  const handleBackToHome = () => {
    setViewingLibrary(false);
    setSelectedArtist(null);
    setYoutubeVideos([]);
    fetchArtists();
  };

  const isFavorite = (artist) => {
    return favorites.some(fav => fav.id === artist.id);
  };

  const filteredGenres = genres.filter((genre) =>
    genre.toLowerCase().includes(genreSearchTerm.toLowerCase())
  );

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <div className={`bg-dark p-3 ${menuOpen ? 'col-3' : 'col-1'} d-flex flex-column`}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="btn btn-outline-light mb-4"
        >
          ☰
        </button>

        {menuOpen && (
          <>
            <button
              className="btn btn-outline-light mb-4"
              onClick={handleBackToHome}
            >
              Inicio
            </button>

            <button
              className="btn btn-outline-light mb-4"
              onClick={handleViewLibrary}
            >
              Biblioteca
            </button>

            <h2 className="text-white">Género</h2>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar género"
                value={genreSearchTerm}
                onChange={handleGenreSearch}
              />
            </div>
            <ul className="list-unstyled">
              {filteredGenres.map((genre) => (
                <li key={genre} className="my-2">
                  <button
                    className="btn btn-outline-light btn-block"
                    onClick={() => fetchArtistsByGenre(genre)}
                  >
                    {genre}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="flex-grow-1 p-4 bg-secondary text-white">
        {!youtubeVideos.length && !viewingLibrary ? (
          <>
            <form onSubmit={handleSearchSubmit} className="mb-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar artista"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <button className="btn btn-outline-light" type="submit">Buscar</button>
              </div>
            </form>

            <h2>Descubrir Artistas</h2>
            <div className="row">
              {artists.map((artist) => (
                <div key={artist.id} className="col-md-3 mb-4">
                  <div className="card bg-dark text-white h-100">
                    <img
                      src={artist.images[0]?.url || 'https://via.placeholder.com/150'}
                      className="card-img-top"
                      alt={artist.name}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{artist.name}</h5>
                      <button
                        className="btn btn-success"
                        onClick={() => fetchYoutubeVideo(artist)}
                      >
                        Ver
                      </button>
                      <button
                        className={`btn btn-link ${isFavorite(artist) ? 'text-danger' : 'text-white'}`}
                        onClick={() => toggleFavorite(artist)}
                      >
                        <FaHeart />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : viewingLibrary ? (
          <>
            <h2>Mi Biblioteca</h2>
            <div className="row">
              {favorites.length === 0 ? (
                <p>No tienes artistas favoritos aún.</p>
              ) : (
                favorites.map((artist) => (
                  <div key={artist.id} className="col-md-3 mb-4">
                    <div className="card bg-dark text-white h-100">
                      <img
                        src={artist.images[0]?.url || 'https://via.placeholder.com/150'}
                        className="card-img-top"
                        alt={artist.name}
                      />
                      <div className="card-body">
                        <h5 className="card-title">{artist.name}</h5>
                        <button
                          className="btn btn-success"
                          onClick={() => fetchYoutubeVideo(artist)}
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <>
            <button className="btn btn-outline-light mb-4" onClick={handleBackToArtists}>
              <FaArrowLeft /> Volver
            </button>
            <h2 className="mb-4">Artista: {selectedArtist.name}</h2>
            
            <div className="row">
              <div className="col-md-8">
                <div className="row">
                  {youtubeVideos.map((video) => (
                    <div key={video.videoId} className="col-md-6 mb-4">
                      <iframe
                        width="100%"
                        height="200"
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={video.title}
                      ></iframe>
                      <p>{video.description.slice(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-md-4">
                <div className="card bg-dark text-white">
                  <img
                    src={selectedArtist.images[0]?.url || 'https://via.placeholder.com/150'}
                    className="card-img-top"
                    alt={selectedArtist.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{selectedArtist.name}</h5>
                    <p className="card-text">
                      Popularidad: {selectedArtist.popularity} <br />
                      Seguidores: {selectedArtist.followers.total.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
