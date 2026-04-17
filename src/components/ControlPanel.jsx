import { useState } from 'react';

const toggles = [
  { key: 'showSkeleton', label: 'Skeleton', icon: '🦴' },
  { key: 'showLasers', label: 'Lasers', icon: '⚡' },
  { key: 'showParticles', label: 'Particles', icon: '✨' },
  { key: 'showTrails', label: 'Trails', icon: '🌈' },
  { key: 'soundEnabled', label: 'Sound', icon: '🔊' },
];

export default function ControlPanel({ settings, onSettingsChange }) {
  const [collapsed, setCollapsed] = useState(false);

  function handleToggle(key) {
    onSettingsChange({ ...settings, [key]: !settings[key] });
  }

  return (
    <div className={`control-panel ${collapsed ? 'collapsed' : ''}`} id="control-panel">
      <button
        className="control-panel-toggle"
        onClick={() => setCollapsed(!collapsed)}
        id="control-panel-toggle"
        aria-label="Toggle control panel"
      >
        <span className="gear-icon">{collapsed ? '⚙️' : '✕'}</span>
      </button>

      {!collapsed && (
        <div className="control-panel-body">
          <h3 className="control-panel-title">Effects</h3>
          {toggles.map(({ key, label, icon }) => (
            <label className="toggle-row" key={key} id={`toggle-${key}`}>
              <span className="toggle-label">
                <span className="toggle-icon">{icon}</span>
                {label}
              </span>
              <div
                className={`toggle-switch ${settings[key] ? 'active' : ''}`}
                onClick={() => handleToggle(key)}
                role="switch"
                aria-checked={settings[key]}
                tabIndex={0}
              >
                <div className="toggle-knob" />
              </div>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
