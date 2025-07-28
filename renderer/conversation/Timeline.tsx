import React from 'react';

interface PlayerState {
  isPlaying: boolean;
  progress: number;
  speed: number;
}

interface TimelineProps {
  playerState: PlayerState;
  onPlayPause: () => void;
  onScrub: (progress: number) => void;
  onSpeedChange: (speed: number) => void;
}

/**
 * Renders a playback timeline with controls.
 * @param {TimelineProps} props The component props.
 * @returns A React component.
 */
export function Timeline({ playerState, onPlayPause, onScrub, onSpeedChange }: TimelineProps) {
  return (
    <div className="flex items-center space-x-4 p-6 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10">
      <button 
        onClick={onPlayPause} 
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl hover:from-purple-600 hover:to-blue-600 backdrop-blur-xl border border-purple-400/30"
      >
        {playerState.isPlaying ? '⏸️ Pause' : '▶️ Play'}
      </button>
      <div className="flex-1">
        <input
          type="range"
          min="0"
          max="100"
          value={playerState.progress}
          onChange={(e) => onScrub(Number(e.target.value))}
          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${playerState.progress}%, rgba(255,255,255,0.2) ${playerState.progress}%, rgba(255,255,255,0.2) 100%)`
          }}
        />
      </div>
      <select
        value={playerState.speed}
        onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="bg-white/10 backdrop-blur-xl text-white p-3 rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
      >
        <option value="0.5">0.5x</option>
        <option value="1">1x</option>
        <option value="1.5">1.5x</option>
        <option value="2">2x</option>
      </select>
    </div>
  );
}

export default Timeline; 