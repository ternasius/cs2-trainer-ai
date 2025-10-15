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

      console.log('Analysis data:', data.analysis);
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

  // Helper function to render zero-sum metrics (where 0 = average)
  const renderZeroSumMetric = (icon, name, valueKey, tierKey, decimals = 1, isReversed = false) => {
    const value = results.analysis[valueKey];
    const tier = results.analysis[tierKey];
    if (value === undefined) return null;
    
    return (
      <div className="skill-diff" key={valueKey}>
        {icon} <strong>{name}:</strong> {value.toFixed(decimals)} ({tier})
      </div>
    );
  };

  // Helper function to render difference metrics
  const renderDiffMetric = (icon, name, diffKey, unit = '', decimals = 1, isReversed = false) => {
    const diff = results.analysis[diffKey];
    if (diff === undefined) return null;
    
    const performance = isReversed 
      ? (diff < 0 ? 'Above' : diff > 0 ? 'Below' : 'Average')
      : (diff > 0 ? 'Above' : diff < 0 ? 'Below' : 'Average');
    
    return (
      <div className="skill-diff" key={diffKey}>
        {icon} <strong>{name}:</strong> {diff > 0 ? '+' : ''}{diff.toFixed(decimals)}{unit} (<span className={`performance-${performance.toLowerCase()}`}>{performance} average</span>)
      </div>
    );
  };

  // Helper function to format AI recommendations
  const formatRecommendations = (text) => {
    if (!text) return '';
    
    return text
      .split('\n')
      .map((line, index) => {
        // Handle bullet points (single asterisk at start of line)
        if (line.trim().startsWith('* ')) {
          const content = line.replace(/^\s*\*\s*/, '');
          let formattedContent = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
          return `<li key="${index}">${formattedContent}</li>`;
        }
        // Handle bold text (double asterisks)
        else {
          let formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>');
          return formattedLine ? `<p key="${index}">${formattedLine}</p>` : '';
        }
      })
      .join('');
  };

  // Extract score from AI recommendations
  const extractScore = (text) => {
    const match = text.match(/\*\*Overall Score:\s*(\d+)\/100\*\*/i);
    return match ? parseInt(match[1]) : null;
  };

  // Radial Progress Bar Component
  const RadialProgressBar = ({ score }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return (
      <div className="radial-progress">
        <svg width="140" height="140" className="progress-ring">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#333"
            strokeWidth="8"
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#ff6b35"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="progress-circle"
          />
        </svg>
        <div className="score-text">
          <span className="score-number">{score}</span>
          <span className="score-total">/100</span>
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Analyzing your performance...</p>
          <p className="loading-subtext">This may take a moment</p>
        </div>
      )}
      
      {!loading && !results && (
        <div className="initial-container">
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
              Analyze Performance
            </button>
          </div>
        </div>
      )}
      
      {!loading && results && (
        <div className="container">

        {error && (
          <div className="error">
            {error}
          </div>
        )}

          <div className="results-layout">
            <div className="performance-panel">
              <div className="score-section">
                <h3>🏆 Overall Performance</h3>
                {extractScore(results.recommendations) && (
                  <RadialProgressBar score={extractScore(results.recommendations)} />
                )}
              </div>
              
              <div className="analysis-section">
                <h4>📊 Performance Analysis</h4>
                <div className="analysis">
                  {/* Core Skills */}
                  {results.analysis.aim_diff !== null && (
                    <div className="skill-diff">
                      🎯 <strong>Aim:</strong> {results.analysis.aim_diff > 0 ? '+' : ''}{results.analysis.aim_diff.toFixed(1)} 
                      (<span className={`performance-${results.analysis.aim_diff > 0 ? 'above' : 'below'}`}>{results.analysis.aim_diff > 0 ? 'Above' : 'Below'} Average</span>)
                    </div>
                  )}
                  {results.analysis.positioning_diff !== null && (
                    <div className="skill-diff">
                      📍 <strong>Positioning:</strong> {results.analysis.positioning_diff > 0 ? '+' : ''}{results.analysis.positioning_diff.toFixed(1)} 
                      (<span className={`performance-${results.analysis.positioning_diff > 0 ? 'above' : 'below'}`}>{results.analysis.positioning_diff > 0 ? 'Above' : 'Below'} Average</span>)
                    </div>
                  )}
                  {results.analysis.utility_diff !== null && (
                    <div className="skill-diff">
                      💣 <strong>Utility:</strong> {results.analysis.utility_diff > 0 ? '+' : ''}{results.analysis.utility_diff.toFixed(1)} 
                      (<span className={`performance-${results.analysis.utility_diff > 0 ? 'above' : 'below'}`}>{results.analysis.utility_diff > 0 ? 'Above' : 'Below'} Average</span>)
                    </div>
                  )}
                  
                  {/* Side Performance */}
                  {renderZeroSumMetric('🛡️', 'CT Side', 'ct_leetify', 'ct_leetify_tier')}
                  {renderZeroSumMetric('⚔️', 'T Side', 't_leetify', 't_leetify_tier')}
                  
                  {/* Situational Performance */}
                  {renderZeroSumMetric('🔥', 'Clutch', 'clutch', 'clutch_tier')}
                  {renderZeroSumMetric('⚡', 'Opening Duels', 'opening', 'opening_tier')}
                  
                  {/* Detailed Metrics */}
                  {renderDiffMetric('🎯', 'Headshot Accuracy', 'accuracy_head_diff', '%')}
                  {renderDiffMetric('📡', 'Radar Accuracy', 'accuracy_enemy_spotted_diff', '%')}
                  {renderDiffMetric('🔫', 'Spray Control', 'spray_accuracy_diff', '%')}
                  {renderDiffMetric('🏃', 'Counter-Strafing', 'counter_strafing_good_shots_ratio_diff', '%')}
                  {renderDiffMetric('🎯', 'Pre-aim', 'preaim_diff', '°', 1, true)}
                  {renderDiffMetric('⚡', 'Reaction Time', 'reaction_time_ms_diff', 'ms', 0, true)}
                  {renderDiffMetric('💥', 'Flashbang Effectiveness', 'flashbang_hit_foe_per_flashbang_diff', ' enemies/flash', 2)}
                  {renderDiffMetric('💣', 'HE Grenade Damage', 'he_foes_damage_avg_diff', ' damage', 1)}
                  {renderDiffMetric('💰', 'Utility on Death', 'utility_on_death_avg_diff', '$', 0, true)}
                </div>
              </div>
            </div>

            <div className="recommendations-panel">
              <h3>🏋️ AI Training Recommendations</h3>
              <div 
                className="recommendations-text"
                dangerouslySetInnerHTML={{ __html: formatRecommendations(results.recommendations) }}
              />
            </div>
            
            <button className="analyze-another-btn" onClick={() => setResults(null)}>
              🔄 Analyze Another Player
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;