import React, { useState } from 'react';
import './App.css';

function App() {
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [expandedMetric, setExpandedMetric] = useState(null);



  const metricDefinitions = {
    'aim': 'Overall aim skill rating based on accuracy, crosshair placement, and target acquisition',
    'positioning': 'How well you position yourself on the map for advantageous engagements',
    'utility': 'Effectiveness of grenade usage including smokes, flashes, and HE grenades',
    'accuracy_head': 'Percentage of shots that result in headshots kills',
    'accuracy_enemy_spotted': 'Accuracy when shooting at enemies visible in your field of view',
    'spray_accuracy': 'Accuracy when controlling weapon spray (rifles only)',
    'counter_strafing_good_shots_ratio': 'Percentage of shots taken with proper counter-strafing technique',
    'preaim': 'Average distance needed to move crosshair and damage enemies after first appearance',
    'reaction_time_ms': 'Average time to damage enemies after first appearance',
    'flashbang_hit_foe_per_flashbang': 'Average number of enemies blinded per flashbang thrown',
    'he_foes_damage_avg': 'Average damage dealt to enemies with HE grenades',
    'utility_on_death_avg': 'Average utility value remaining after death',
    'ct_leetify': 'Performance rating specifically on CT side',
    't_leetify': 'Performance rating specifically on T side',
    'clutch': 'Performance in clutch situations (1vX scenarios)',
    'opening': 'Performance in opening duels at round start'
  };

  const analyzePlayer = async () => {
    if (!steamId.trim()) {
      setError('Please enter a Steam ID');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`https://cs-project1-827962626003.us-central1.run.app/analyze/${steamId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Analysis failed');
      }

      console.log('Analysis data:', data.analysis);
      console.log('Reference values:', data.analysis.reference_values);
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

  // Function to evaluate performance using Leetify tier labels from Elasticsearch
  const evaluatePerformance = (diffValue, metricKey) => {
    if (!results?.analysis?.leetify_tiers) {
      return 'Average';
    }
    
    const thresholds = {
      'aim': 1.0,
      'positioning': 1.0,
      'utility': 1.0,
      'accuracy_enemy_spotted': 1.0,
      'accuracy_head': 1.0,
      'counter_strafing_good_shots_ratio': 1.0,
      'spray_accuracy': 1.0,
      'ct_leetify': 1.0,
      't_leetify': 1.0,
      'clutch': 1.0,
      'opening': 1.0,
      'he_foes_damage_avg': 0.1,
      'preaim': -0.2,
      'flashbang_hit_foe_per_flashbang': 0.05,
      'reaction_time_ms': 10,
      'utility_on_death_avg': -5
    };
    
    const tiers = results.analysis.leetify_tiers;
    const weight = thresholds[metricKey] || 1.0;
    const evalValue = diffValue * Math.sign(weight);
    
    // Apply weight to leetify tier thresholds
    if (evalValue >= tiers.great?.[0] * weight) {
      return 'Great';
    } else if (evalValue >= tiers.good?.[0] * weight) {
      return 'Good';
    } else if (evalValue >= tiers.average?.[0] * weight && evalValue <= tiers.average?.[1] * weight) {
      return 'Average';
    } else if (evalValue >= tiers.subpar?.[0] * weight) {
      return 'Subpar';
    } else {
      return 'Poor';
    }
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
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]/g, '<span class="metric-highlight">$1</span>');
          return `<li key="${index}">${formattedContent}</li>`;
        }
        // Handle bold text (double asterisks)
        else {
          let formattedLine = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/\[([^\]]+)\]/g, '<span class="metric-highlight">$1</span>');
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

  // Metric Row Component with dropdown
  const MetricRow = ({ metricKey, icon, name, value, performance, baseline, unit = '', children }) => {
    const isExpanded = expandedMetric === metricKey;
    const definition = metricDefinitions[metricKey];
    
    return (
      <div className="metric-container">
        <div 
          className="skill-diff hoverable-metric"
          onClick={() => setExpandedMetric(isExpanded ? null : metricKey)}
        >
          <div className="metric-content">
            {icon} <strong>{name}:</strong> {value}
            {performance && (
              <span> (<span className={`performance-${performance.toLowerCase()}`}>{performance}</span>)</span>
            )}
            {baseline && (
              <span className="reference-value"> Baseline: {baseline}{unit}</span>
            )}
            {children}
          </div>
          <div className="dropdown-arrow">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
        {isExpanded && definition && (
          <div className="metric-definition">
            {definition}
          </div>
        )}
      </div>
    );
  };

  // Radial Progress Bar Component
  const RadialProgressBar = ({ score }) => {
    const [animatedScore, setAnimatedScore] = useState(0);
    const [startAnimation, setStartAnimation] = useState(false);
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = startAnimation ? circumference - (score / 100) * circumference : circumference;
    
    React.useEffect(() => {
      const timer = setTimeout(() => {
        setStartAnimation(true);
        let current = 0;
        const increment = score / 50;
        const interval = setInterval(() => {
          current += increment;
          if (current >= score) {
            current = score;
            clearInterval(interval);
          }
          setAnimatedScore(Math.round(current));
        }, 30);
      }, 300);
      
      return () => clearTimeout(timer);
    }, [score]);
    
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
          <span className="score-number">{animatedScore}</span>
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
                {results.analysis.reference_rank && (
                  <div className="reference-rank-prominent">
                    📊 Compared to: <strong>{results.analysis.reference_rank}</strong>
                  </div>
                )}
                {extractScore(results.recommendations) && (
                  <RadialProgressBar score={extractScore(results.recommendations)} />
                )}
              </div>
              
              <div className="analysis-section">
                <h4>🎯 General Performance</h4>
                <div className="analysis">
                  {/* Side Performance */}
                  {results.analysis.ct_leetify !== undefined && (
                    <MetricRow
                      metricKey="ct_leetify"
                      icon="🛡️"
                      name="CT Side Rating"
                      value={`${results.analysis.ct_leetify > 0 ? '+' : ''}${results.analysis.ct_leetify.toFixed(2)}`}
                      performance={evaluatePerformance(results.analysis.ct_leetify, 'ct_leetify')}
                    />
                  )}
                  {results.analysis.t_leetify !== undefined && (
                    <MetricRow
                      metricKey="t_leetify"
                      icon="⚔️"
                      name="T Side Rating"
                      value={`${results.analysis.t_leetify > 0 ? '+' : ''}${results.analysis.t_leetify.toFixed(2)}`}
                      performance={evaluatePerformance(results.analysis.t_leetify, 't_leetify')}
                    />
                  )}
                  
                  {/* Situational Performance */}
                  {results.analysis.clutch !== undefined && (
                    <MetricRow
                      metricKey="clutch"
                      icon="🔥"
                      name="Clutch"
                      value={`${results.analysis.clutch > 0 ? '+' : ''}${results.analysis.clutch.toFixed(2)}`}
                      performance={evaluatePerformance(results.analysis.clutch, 'clutch')}
                    />
                  )}
                  {results.analysis.opening !== undefined && (
                    <MetricRow
                      metricKey="opening"
                      icon="⚡"
                      name="Opening Duels"
                      value={`${results.analysis.opening > 0 ? '+' : ''}${results.analysis.opening.toFixed(2)}`}
                      performance={evaluatePerformance(results.analysis.opening, 'opening')}
                    />
                  )}
                </div>
              </div>
              
              <div className="analysis-section">
                <h4>📈 Detailed Performance</h4>
                <div className="analysis">
                  {/* Core Skills */}
                  {results.analysis.aim_diff !== null && (
                    <MetricRow
                      metricKey="aim"
                      icon="🎯"
                      name="Aim"
                      value={`${results.analysis.aim_diff > 0 ? '+' : ''}${results.analysis.aim_diff.toFixed(2)} `}
                      performance={evaluatePerformance(results.analysis.aim_diff, 'aim')}
                      baseline={results.analysis.reference_values?.aim}
                    />
                  )}
                  {results.analysis.positioning_diff !== null && (
                    <MetricRow
                      metricKey="positioning"
                      icon="📍"
                      name="Positioning"
                      value={`${results.analysis.positioning_diff > 0 ? '+' : ''}${results.analysis.positioning_diff.toFixed(2)} `}
                      performance={evaluatePerformance(results.analysis.positioning_diff, 'positioning')}
                      baseline={results.analysis.reference_values?.positioning}
                    />
                  )}
                  {results.analysis.utility_diff !== null && (
                    <MetricRow
                      metricKey="utility"
                      icon="💣"
                      name="Utility"
                      value={`${results.analysis.utility_diff > 0 ? '+' : ''}${results.analysis.utility_diff.toFixed(2)} `}
                      performance={evaluatePerformance(results.analysis.utility_diff, 'utility')}
                      baseline={results.analysis.reference_values?.utility}
                    />
                  )}
                  
                  {/* Detailed Metrics */}
                  {results.analysis.accuracy_head_diff !== undefined && (
                    <MetricRow
                      metricKey="accuracy_head"
                      icon="🎯"
                      name="Headshot Accuracy"
                      value={`${results.analysis.accuracy_head_diff > 0 ? '+' : ''}${results.analysis.accuracy_head_diff.toFixed(2)}%`}
                      performance={evaluatePerformance(results.analysis.accuracy_head_diff, 'accuracy_head')}
                      baseline={results.analysis.reference_values?.accuracy_head}
                      unit="%"
                    />
                  )}
                  {results.analysis.accuracy_enemy_spotted_diff !== undefined && (
                    <MetricRow
                      metricKey="accuracy_enemy_spotted"
                      icon="📡"
                      name="Spotted Accuracy"
                      value={`${results.analysis.accuracy_enemy_spotted_diff > 0 ? '+' : ''}${results.analysis.accuracy_enemy_spotted_diff.toFixed(2)}%`}
                      performance={evaluatePerformance(results.analysis.accuracy_enemy_spotted_diff, 'accuracy_enemy_spotted')}
                      baseline={results.analysis.reference_values?.accuracy_enemy_spotted}
                      unit="%"
                    />
                  )}
                  {results.analysis.spray_accuracy_diff !== undefined && (
                    <MetricRow
                      metricKey="spray_accuracy"
                      icon="🔫"
                      name="Spray Accuracy"
                      value={`${results.analysis.spray_accuracy_diff > 0 ? '+' : ''}${results.analysis.spray_accuracy_diff.toFixed(2)}%`}
                      performance={evaluatePerformance(results.analysis.spray_accuracy_diff, 'spray_accuracy')}
                      baseline={results.analysis.reference_values?.spray_accuracy}
                      unit="%"
                    />
                  )}
                  {results.analysis.counter_strafing_good_shots_ratio_diff !== undefined && (
                    <MetricRow
                      metricKey="counter_strafing_good_shots_ratio"
                      icon="🏃"
                      name="Counter-Strafing"
                      value={`${results.analysis.counter_strafing_good_shots_ratio_diff > 0 ? '+' : ''}${results.analysis.counter_strafing_good_shots_ratio_diff.toFixed(2)}%`}
                      performance={evaluatePerformance(results.analysis.counter_strafing_good_shots_ratio_diff, 'counter_strafing_good_shots_ratio')}
                      baseline={results.analysis.reference_values?.counter_strafing_good_shots_ratio}
                      unit="%"
                    />
                  )}
                  {results.analysis.preaim_diff !== undefined && (
                    <MetricRow
                      metricKey="preaim"
                      icon="🎯"
                      name="Crosshair Placement"
                      value={`${results.analysis.preaim_diff > 0 ? '+' : ''}${results.analysis.preaim_diff.toFixed(2)}°`}
                      performance={evaluatePerformance(results.analysis.preaim_diff, 'preaim')}
                      baseline={results.analysis.reference_values?.preaim}
                      unit="°"
                    />
                  )}
                  {results.analysis.reaction_time_ms_diff !== undefined && (
                    <MetricRow
                      metricKey="reaction_time_ms"
                      icon="⚡"
                      name="Time to Damage"
                      value={`${results.analysis.reaction_time_ms_diff > 0 ? '+' : ''}${results.analysis.reaction_time_ms_diff.toFixed(2)}ms`}
                      performance={evaluatePerformance(results.analysis.reaction_time_ms_diff, 'reaction_time_ms')}
                      baseline={results.analysis.reference_values?.reaction_time_ms}
                      unit="ms"
                    />
                  )}
                  {results.analysis.flashbang_hit_foe_per_flashbang_diff !== undefined && (
                    <MetricRow
                      metricKey="flashbang_hit_foe_per_flashbang"
                      icon="💥"
                      name="Flashbang Effectiveness"
                      value={`${results.analysis.flashbang_hit_foe_per_flashbang_diff > 0 ? '+' : ''}${results.analysis.flashbang_hit_foe_per_flashbang_diff.toFixed(2)} enemies/flash`}
                      performance={evaluatePerformance(results.analysis.flashbang_hit_foe_per_flashbang_diff, 'flashbang_hit_foe_per_flashbang')}
                      baseline={results.analysis.reference_values?.flashbang_hit_foe_per_flashbang}
                    />
                  )}
                  {results.analysis.he_foes_damage_avg_diff !== undefined && (
                    <MetricRow
                      metricKey="he_foes_damage_avg"
                      icon="💣"
                      name="Average HE Damage"
                      value={`${results.analysis.he_foes_damage_avg_diff > 0 ? '+' : ''}${results.analysis.he_foes_damage_avg_diff.toFixed(2)} damage`}
                      performance={evaluatePerformance(results.analysis.he_foes_damage_avg_diff, 'he_foes_damage_avg')}
                      baseline={results.analysis.reference_values?.he_foes_damage_avg}
                    />
                  )}
                  {results.analysis.utility_on_death_avg_diff !== undefined && (
                    <MetricRow
                      metricKey="utility_on_death_avg"
                      icon="💰"
                      name="Utility on Death"
                      value={`${results.analysis.utility_on_death_avg_diff > 0 ? '+' : ''}${results.analysis.utility_on_death_avg_diff.toFixed(2)}$`}
                      performance={evaluatePerformance(results.analysis.utility_on_death_avg_diff, 'utility_on_death_avg')}
                      baseline={results.analysis.reference_values?.utility_on_death_avg}
                      unit="$"
                    />
                  )}
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