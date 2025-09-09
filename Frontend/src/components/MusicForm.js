import React, { useState, useEffect } from 'react';
import { Search, Music, TrendingUp, Activity } from 'lucide-react';

const MusicForm = ({ onSubmit, stats }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [songs, setSongs] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSong, setSelectedSong] = useState(null);
  const [userGuess, setUserGuess] = useState('');

  useEffect(() => {
    if (searchQuery.length > 0 && !selectedSong) {
      fetchSongs(searchQuery);
    } else if (searchQuery.length === 0) {
      setSongs([]);
      setShowDropdown(false);
    }
  }, [searchQuery, selectedSong]);

  const fetchSongs = async (query) => {
    try {
      const response = await fetch(`http://localhost:5001/api/songs?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSongs(data.songs || []);
      setShowDropdown(data.songs && data.songs.length > 0);
    } catch (err) {
      console.error('Could not fetch songs');
    }
  };

  const handleSongSelect = (song) => {
    setSelectedSong(song);
    setShowDropdown(false);
    setSearchQuery(song.song_name);
    setSongs([]); // Clear the songs array to prevent interference
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedSong && userGuess) {
      onSubmit(selectedSong.song_name, userGuess);
    }
  };

  const chooseGuess = (guess) => {
    setUserGuess(guess);
    if (selectedSong) {
      onSubmit(selectedSong.song_name, guess);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedSong(null);
    setUserGuess('');
    setSongs([]);
    setShowDropdown(false);
  };

  return (
    <div className="music-form-container">
      <div className="form-header">
        <h2>Music Popularity Predictor</h2>
        <p>Select a song from the dataset to predict its popularity using an Extra Trees Classifier model</p>
        
        {stats && (
          <div className="stats-container">
            <div className="stat-item">
              <Music className="stat-icon" />
              <span className="stat-value">{stats.total_songs}</span>
              <span className="stat-label">Songs in Dataset</span>
            </div>
            <div className="stat-item">
              <TrendingUp className="stat-icon" />
              <span className="stat-value">{stats.avg_popularity}</span>
              <span className="stat-label">Avg Popularity</span>
            </div>
            <div className="stat-item">
              <Activity className="stat-icon" />
              <span className="stat-value">{stats.feature_count}</span>
              <span className="stat-label">Audio Features</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="search-container">
          <label htmlFor="song-search">Search for a song:</label>
          <div className="search-input-wrapper">
            <Search className="search-icon" />
            <input
              id="song-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type song name..."
              autoComplete="off"
            />
          </div>
          
          {showDropdown && (
            <div className="dropdown-container">
              <div className="dropdown-header">
                Found {songs.length} song{songs.length !== 1 ? 's' : ''}
              </div>
              <div className="dropdown-list">
                {songs.map((song, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleSongSelect(song)}
                  >
                    <Music className="song-icon" />
                    <span className="song-name">{song.song_name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedSong && (
          <div className="guess-container">
            <label>Your guess:</label>
            <div className="feedback-actions" style={{ marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => chooseGuess('popular')}
                className={`btn btn-success feedback-btn${userGuess === 'popular' ? ' active' : ''}`}
              >
                Popular
              </button>
              <button
                type="button"
                onClick={() => chooseGuess('not_popular')}
                className={`btn btn-danger feedback-btn${userGuess === 'not_popular' ? ' active' : ''}`}
              >
                Not Popular
              </button>
            </div>
          </div>
        )}

        <div className="form-actions">
          {selectedSong && (
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              Clear Selection
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default MusicForm; 