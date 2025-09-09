import React, { useState, useEffect } from 'react';
import './App.css';
import MusicForm from './components/MusicForm';
import PredictionResult from './components/PredictionResult';
import Header from './components/Header';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [stats, setStats] = useState(null);
  const [userGuess, setUserGuess] = useState(null);

  // Fetch stats on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.log('Could not fetch stats');
    }
  };

  const handlePrediction = async (songName, guess) => {
    try {
      const response = await fetch(`http://localhost:5001/api/song-details?song_name=${encodeURIComponent(songName)}`);
      const data = await response.json();
      if (data.success) {
        setPrediction(data);
        setUserGuess(guess);
      }
    } catch (err) {
      console.log('Could not get prediction');
    }
  };

  const handleNewPrediction = () => {
    setPrediction(null);
    setUserGuess(null);
  };

  const handleReset = () => {
    setPrediction(null);
    setUserGuess(null);
  };

  return (
    <div className="App">
      <Header onHomeClick={handleReset} />
      <main className="main-content">
        <div className="container">
          {!prediction ? (
            <MusicForm onSubmit={handlePrediction} stats={stats} />
          ) : (
            <PredictionResult 
              prediction={prediction} 
              userGuess={userGuess}
              onNewPrediction={handleNewPrediction} 
              onReset={handleReset} 
            />
          )}
        </div>
      </main>
      <footer className="footer">
        <p>© 2025 Andrew Paternostro. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App; 