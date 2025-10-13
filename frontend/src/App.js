import React, { useState } from 'react';
import './App.css';

function App() {
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const analyzePlayer = async () => {
    if (!steamId.trim()) {
      setError('Please enter a Steam ID');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`/analyze/${steamId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed');
      }

      setResults(data);
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      analyzePlayer();
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>🎯 CS2 Training Recommender</h1>
        
        <div className="input-section">
          <input
            type="text"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your Steam ID"
            disabled={loading}
          />
          <button onClick={analyzePlayer} disabled={loading}>
            {loading ? 'Analyzing...' : 'Analyze Performance'}
          </button>
        </div>

        {loading && (
          <div className="loading">
            <p>🔄 Analyzing your performance... This may take a moment.</p>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {results && (
          <div className="results">
            <div className="weak-areas">
              <h3>📊 Your Performance Analysis</h3>
              <div className="analysis">
                {results.analysis.aim_diff !== null && (
                  <div className="skill-diff">
                    🎯 <strong>Aim:</strong> {results.analysis.aim_diff > 0 ? '+' : ''}{results.analysis.aim_diff.toFixed(1)} 
                    ({results.analysis.aim_diff > 0 ? 'Above' : 'Below'} average)
                  </div>
                )}
                {results.analysis.positioning_diff !== null && (
                  <div className="skill-diff">
                    📍 <strong>Positioning:</strong> {results.analysis.positioning_diff > 0 ? '+' : ''}{results.analysis.positioning_diff.toFixed(1)} 
                    ({results.analysis.positioning_diff > 0 ? 'Above' : 'Below'} average)
                  </div>
                )}
                {results.analysis.utility_diff !== null && (
                  <div className="skill-diff">
                    💣 <strong>Utility:</strong> {results.analysis.utility_diff > 0 ? '+' : ''}{results.analysis.utility_diff.toFixed(1)} 
                    ({results.analysis.utility_diff > 0 ? 'Above' : 'Below'} average)
                  </div>
                )}
                {results.analysis.focus && results.analysis.focus.length > 0 && (
                  <div className="focus-areas">
                    <strong>🔍 Areas to focus on:</strong> {results.analysis.focus.join(', ')}
                  </div>
                )}
              </div>
            </div>

            <div className="recommendations">
              <h3>🏋️ AI Training Recommendations</h3>
              <div className="recommendations-text">
                {results.recommendations}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;