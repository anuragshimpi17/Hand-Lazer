import { useState, useCallback } from 'react';
import HandTracker from './components/HandTracker.jsx';
import ControlPanel from './components/ControlPanel.jsx';
import { initAudio, resumeAudio } from './engine/soundEngine.js';
import './App.css';

export default function App() {
  const [settings, setSettings] = useState({
    showSkeleton: true,
    showLasers: true,
    showParticles: true,
    showTrails: true,
    soundEnabled: false,
  });

  const [started, setStarted] = useState(false);

  const handleStart = useCallback(() => {
    initAudio();
    resumeAudio();
    setStarted(true);
  }, []);

  const handleSettingsChange = useCallback((newSettings) => {
    setSettings(newSettings);
    if (newSettings.soundEnabled) {
      initAudio();
      resumeAudio();
    }
  }, []);

  if (!started) {
    return (
      <div className="start-screen" id="start-screen">
        <div className="start-content">
          <h1 className="start-title">
            <span className="title-glow">HAND</span>
            <span className="title-laser">LAZER</span>
          </h1>
          <p className="start-subtitle">
            Real-time hand tracking with neon laser visuals
          </p>
          <button className="start-button" onClick={handleStart} id="start-button">
            <span className="button-text">Launch Experience</span>
            <span className="button-glow" />
          </button>
          <p className="start-hint">Requires webcam access • Works best in Chrome</p>
        </div>
        <div className="start-bg-grid" />
      </div>
    );
  }

  return (
    <div className="app" id="app-container">
      <HandTracker settings={settings} />
      <ControlPanel settings={settings} onSettingsChange={handleSettingsChange} />
    </div>
  );
}
