import React, { useState } from 'react';
import { 
  Music, BarChart3, Activity, Clock, Volume2, Zap, Heart, Mic, 
  TrendingUp, ThumbsUp, ThumbsDown, RefreshCw
} from 'lucide-react';

const PredictionResult = ({ prediction, userGuess, onNewPrediction, onReset }) => {
  const [feedback, setFeedback] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Dataset averages for comparison (these would ideally come from the backend)
  const datasetAverages = {
    danceability: 0.65,
    energy: 0.65,
    loudness: -8.0,
    speechiness: 0.08,
    acousticness: 0.25,
    instrumentalness: 0.1,
    liveness: 0.15,
    valence: 0.5,
    tempo: 120,
    song_duration_ms: 200000
  };

  // Thresholds for what's considered "unusual" (can be adjusted)
  const thresholds = {
    danceability: 0.15,
    energy: 0.2,
    loudness: 5.0,
    speechiness: 0.05,
    acousticness: 0.3,
    instrumentalness: 0.2,
    liveness: 0.2,
    valence: 0.25,
    tempo: 30,
    song_duration_ms: 60000
  };

  const getPopularityLevel = (score) => {
    if (score >= 80) return { level: 'Viral Hit', color: '#10b981', emoji: '' };
    if (score >= 60) return { level: 'Popular', color: '#3b82f6', emoji: '' };
    if (score >= 40) return { level: 'Moderate', color: '#f59e0b', emoji: '' };
    if (score >= 20) return { level: 'Niche', color: '#ef4444', emoji: '' };
    return { level: 'Underground', color: '#8b5cf6', emoji: '' };
  };

  const getPopularityColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#3b82f6';
    if (score >= 40) return '#f59e0b';
    if (score >= 20) return '#ef4444';
    return '#8b5cf6';
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getKeyName = (key) => {
    const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return keys[key] || key;
  };

  // Check if a feature is unusual compared to dataset average
  const isFeatureUnusual = (featureName, value) => {
    if (!datasetAverages[featureName]) return false;
    
    const average = datasetAverages[featureName];
    const threshold = thresholds[featureName];
    const difference = Math.abs(value - average);
    
    return difference > threshold;
  };

  // Get the type of unusualness (high or low)
  const getUnusualType = (featureName, value) => {
    if (!datasetAverages[featureName]) return null;
    
    const average = datasetAverages[featureName];
    if (value > average + thresholds[featureName]) return 'high';
    if (value < average - thresholds[featureName]) return 'low';
    return null;
  };

  // Get explanation for why a feature might affect popularity
  const getFeatureExplanation = (featureName, value) => {
    const unusualType = getUnusualType(featureName, value);
    if (!unusualType) return null;

    const explanations = {
      danceability: {
        high: "Very high danceability can make songs feel repetitive",
        low: "Very low danceability can make songs feel stiff or unengaging"
      },
      energy: {
        high: "Extremely high energy can be overwhelming",
        low: "Very low energy can make songs feel boring or slow"
      },
      loudness: {
        high: "Too loud can cause listener fatigue",
        low: "Too quiet can make songs hard to hear"
      },
      speechiness: {
        high: "High speechiness can limit musical appeal",
        low: "Very low speechiness is normal for most songs"
      },
      acousticness: {
        high: "Very acoustic can limit mainstream appeal",
        low: "Very electronic can feel artificial"
      },
      instrumentalness: {
        high: "Very instrumental can limit vocal appeal",
        low: "Very vocal-focused is normal for pop music"
      },
      liveness: {
        high: "High liveness can feel unpolished",
        low: "Very low liveness is normal for studio recordings"
      },
      valence: {
        high: "Very high valence can feel overly happy",
        low: "Very low valence can feel depressing"
      },
      tempo: {
        high: "Very fast tempo can feel rushed",
        low: "Very slow tempo can feel sluggish"
      },
      song_duration_ms: {
        high: "Very long songs can lose listener attention",
        low: "Very short songs can feel incomplete"
      }
    };

    return explanations[featureName]?.[unusualType] || null;
  };

  const handleFeedback = async (rating) => {
    try {
      const response = await fetch('http://localhost:5001/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          song_name: prediction.song.song_name,
          predicted_popularity: prediction.song.predicted_popularity,
          user_rating: rating,
          feedback_text: feedback
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        setFeedbackSubmitted(true);
      }
    } catch (err) {
      console.error('Could not save feedback');
    }
  };

  const song = prediction.song;
  const predictedInfo = getPopularityLevel(song.predicted_popularity);
  const actualInfo = getPopularityLevel(song.actual_popularity);
  const predictedColor = getPopularityColor(song.predicted_popularity);
  const actualColor = getPopularityColor(song.actual_popularity);
  // Binary view helpers
  const POP_THRESHOLD = 56;
  const userGuessLabel = userGuess === 'popular' ? 'Popular' : 'Not Popular';
  // Color for user guess to match our label palette
  const userGuessColor = userGuess === 'popular' ? '#3b82f6' : '#8b5cf6';
  const modelLabel = song.predicted_popularity >= 50 ? 'Popular' : 'Not Popular';
  const actualLabel = song.actual_popularity >= POP_THRESHOLD ? 'Popular' : 'Not Popular';

  return (
    <div className="prediction-result">
      <div className="result-header">
        <h2>Song Analysis Results</h2>
        <p>Detailed breakdown of "{song.song_name}" using an Extra Trees Classifier model</p>
      </div>

      <div className="result-content">
        {/* Song Title */}
        <div className="song-title">
          <Music className="icon" />
          <h3>{song.song_name}</h3>
        </div>

        {/* Popularity Comparison */}
        <div className="popularity-comparison">
          <h4><BarChart3 className="icon" /> Popularity Analysis</h4>
          <div className="comparison-grid">
            <div className="comparison-item">
              <h5>Your Guess</h5>
              <div className="score-display" style={{ '--score-color': userGuessColor }}>
                <span className="score-number">{userGuessLabel}</span>
              </div>
            </div>
            
            <div className="comparison-item">
              <h5>Extra Trees prediction:</h5>
              <div className="score-display" style={{ '--score-color': predictedColor }}>
                <span className="score-number">{modelLabel}</span>
              </div>
              {song.regression_popularity !== null && song.regression_popularity !== undefined && (
                <div className="score-level">Random Forest prediction: {song.regression_popularity}/100</div>
              )}
            </div>
            
            <div className="comparison-item">
              <h5>Actual Popularity</h5>
              <div className="score-display" style={{ '--score-color': actualColor }}>
                <span className="score-number">{actualLabel}</span>
              </div>
              <div className="score-level">Spotify popularity score: {song.actual_popularity}/100</div>
            </div>
          </div>
          
          <div className="prediction-comparison">
            <div style={{ marginBottom: '0.5rem' }}>A song is considered <strong>Popular</strong> if its popularity score is ≥ {POP_THRESHOLD}; otherwise it is <strong>Not Popular</strong>.</div>
            <div>
              <span className="comparison-label">Summary:</span>
              {' '}You predicted <strong>{userGuessLabel}</strong>
              {' '}• Model predicted <strong>{modelLabel}</strong>
              {' '}• Actual is <strong>{actualLabel}</strong>.
            </div>
          </div>
        </div>

        {/* Audio Features with Unusual Indicators */}
        <div className="audio-features">
          <h4><Activity className="icon" /> Audio Features Breakdown</h4>
          <p className="features-description">
            Features highlighted in <span style={{color: '#b3b3b3'}}>orange</span> or <span style={{color: '#b3b3b3'}}>red</span> are significantly different from typical songs and may explain the popularity score.
          </p>
          <div className="features-grid">
            <div className={`feature-item ${isFeatureUnusual('song_duration_ms', song.features.song_duration_ms) ? `unusual-${getUnusualType('song_duration_ms', song.features.song_duration_ms)}` : ''}`}>
              <Clock className="feature-icon" />
              <span className="feature-label">Duration</span>
              <span className="feature-value">{formatDuration(song.features.song_duration_ms)}</span>
              {isFeatureUnusual('song_duration_ms', song.features.song_duration_ms) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('song_duration_ms', song.features.song_duration_ms) === 'high' ? 'Long' : 'Short'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('song_duration_ms', song.features.song_duration_ms)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('loudness', song.features.loudness) ? `unusual-${getUnusualType('loudness', song.features.loudness)}` : ''}`}>
              <Volume2 className="feature-icon" />
              <span className="feature-label">Loudness</span>
              <span className="feature-value">{song.features.loudness} dB</span>
              {isFeatureUnusual('loudness', song.features.loudness) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('loudness', song.features.loudness) === 'high' ? 'Loud' : 'Quiet'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('loudness', song.features.loudness)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('energy', song.features.energy) ? `unusual-${getUnusualType('energy', song.features.energy)}` : ''}`}>
              <Zap className="feature-icon" />
              <span className="feature-label">Energy</span>
              <span className="feature-value">{song.features.energy}</span>
              {isFeatureUnusual('energy', song.features.energy) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('energy', song.features.energy) === 'high' ? 'High' : 'Low'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('energy', song.features.energy)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('danceability', song.features.danceability) ? `unusual-${getUnusualType('danceability', song.features.danceability)}` : ''}`}>
              <Heart className="feature-icon" />
              <span className="feature-label">Danceability</span>
              <span className="feature-value">{song.features.danceability}</span>
              {isFeatureUnusual('danceability', song.features.danceability) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('danceability', song.features.danceability) === 'high' ? 'High' : 'Low'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('danceability', song.features.danceability)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('speechiness', song.features.speechiness) ? `unusual-${getUnusualType('speechiness', song.features.speechiness)}` : ''}`}>
              <Mic className="feature-icon" />
              <span className="feature-label">Speechiness</span>
              <span className="feature-value">{song.features.speechiness}</span>
              {isFeatureUnusual('speechiness', song.features.speechiness) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('speechiness', song.features.speechiness) === 'high' ? 'High' : 'Low'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('speechiness', song.features.speechiness)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('acousticness', song.features.acousticness) ? `unusual-${getUnusualType('acousticness', song.features.acousticness)}` : ''}`}>
              <Music className="feature-icon" />
              <span className="feature-label">Acousticness</span>
              <span className="feature-value">{song.features.acousticness}</span>
              {isFeatureUnusual('acousticness', song.features.acousticness) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('acousticness', song.features.acousticness) === 'high' ? 'High' : 'Low'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('acousticness', song.features.acousticness)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('key', song.features.key) ? `unusual-${getUnusualType('key', song.features.key)}` : ''}`}>
              <Music className="feature-icon" />
              <span className="feature-label">Key</span>
              <span className="feature-value">{getKeyName(song.features.key)}</span>
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('audio_mode', song.features.audio_mode) ? `unusual-${getUnusualType('audio_mode', song.features.audio_mode)}` : ''}`}>
              <Music className="feature-icon" />
              <span className="feature-label">Mode</span>
              <span className="feature-value">{song.features.audio_mode === 1 ? 'Major' : 'Minor'}</span>
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('tempo', song.features.tempo) ? `unusual-${getUnusualType('tempo', song.features.tempo)}` : ''}`}>
              <Clock className="feature-icon" />
              <span className="feature-label">Tempo</span>
              <span className="feature-value">{song.features.tempo} BPM</span>
              {isFeatureUnusual('tempo', song.features.tempo) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('tempo', song.features.tempo) === 'high' ? 'Fast' : 'Slow'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('tempo', song.features.tempo)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('time_signature', song.features.time_signature) ? `unusual-${getUnusualType('time_signature', song.features.time_signature)}` : ''}`}>
              <Music className="feature-icon" />
              <span className="feature-label">Time Signature</span>
              <span className="feature-value">{song.features.time_signature}/4</span>
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('instrumentalness', song.features.instrumentalness) ? `unusual-${getUnusualType('instrumentalness', song.features.instrumentalness)}` : ''}`}>
              <Music className="feature-icon" />
              <span className="feature-label">Instrumentalness</span>
              <span className="feature-value">{song.features.instrumentalness}</span>
              {isFeatureUnusual('instrumentalness', song.features.instrumentalness) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('instrumentalness', song.features.instrumentalness) === 'high' ? 'High' : 'Low'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('instrumentalness', song.features.instrumentalness)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('liveness', song.features.liveness) ? `unusual-${getUnusualType('liveness', song.features.liveness)}` : ''}`}>
              <Mic className="feature-icon" />
              <span className="feature-label">Liveness</span>
              <span className="feature-value">{song.features.liveness}</span>
              {isFeatureUnusual('liveness', song.features.liveness) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('liveness', song.features.liveness) === 'high' ? 'High' : 'Low'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('liveness', song.features.liveness)}</span>
                </div>
              )}
            </div>
            
            <div className={`feature-item ${isFeatureUnusual('audio_valence', song.features.audio_valence) ? `unusual-${getUnusualType('audio_valence', song.features.audio_valence)}` : ''}`}>
              <Heart className="feature-icon" />
              <span className="feature-label">Valence</span>
              <span className="feature-value">{song.features.audio_valence}</span>
              {isFeatureUnusual('audio_valence', song.features.audio_valence) && (
                <div className="unusual-indicator">
                  <span className="unusual-label">{getUnusualType('audio_valence', song.features.audio_valence) === 'high' ? 'High' : 'Low'}</span>
                  <span className="unusual-explanation">{getFeatureExplanation('audio_valence', song.features.audio_valence)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Feedback */}
        {!feedbackSubmitted ? (
          <div className="user-feedback">
            <h4><TrendingUp className="icon" /> Rate This Prediction</h4>
            <p>How accurate do you think this prediction is?</p>
            
            <div className="feedback-actions">
              <button 
                onClick={() => handleFeedback('like')} 
                className="btn btn-success feedback-btn"
              >
                <ThumbsUp className="icon" />
                Accurate Prediction
              </button>
              
              <button 
                onClick={() => handleFeedback('dislike')} 
                className="btn btn-danger feedback-btn"
              >
                <ThumbsDown className="icon" />
                Inaccurate Prediction
              </button>
            </div>
            

          </div>
        ) : (
          <div className="feedback-submitted">
            <h4>Thank You!</h4>
            <p>Your feedback has been recorded.</p>
          </div>
        )}
      </div>

      <div className="result-actions">
        <button onClick={onNewPrediction} className="btn btn-primary">
          <RefreshCw className="icon" />
          Analyze Another Song
        </button>
        <button onClick={onReset} className="btn btn-secondary">
          Back to Search
        </button>
      </div>
    </div>
  );
};

export default PredictionResult; 