import React, { useState, useEffect } from 'react';
import { dreamEngine, Dream, Dreamscape } from '../../engine/dreamEngine';

interface DreamJournalProps {
  className?: string;
}

export function DreamJournal({ className = '' }: DreamJournalProps) {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [dreamscapes, setDreamscapes] = useState<Dreamscape[]>([]);
  const [selectedDream, setSelectedDream] = useState<Dream | null>(null);
  const [isDreaming, setIsDreaming] = useState(false);

  useEffect(() => {
    // Start the dream engine
    dreamEngine.startDreaming();

    const interval = setInterval(() => {
      setDreams(dreamEngine.getRecentDreams(24));
      setDreamscapes(dreamEngine.getDreamscapes());
      setIsDreaming(dreamEngine.getRecentDreams(1).length > 0);
    }, 10000);

    return () => {
      clearInterval(interval);
      dreamEngine.stopDreaming();
    };
  }, []);

  const getDreamIcon = (type: Dream['type']) => {
    switch (type) {
      case 'lucid': return '👁️';
      case 'surreal': return '🌀';
      case 'prophetic': return '🔮';
      case 'memory': return '📖';
      case 'creative': return '✨';
      default: return '🌙';
    }
  };

  const getDreamColor = (type: Dream['type']) => {
    switch (type) {
      case 'lucid': return 'from-blue-500 to-cyan-500';
      case 'surreal': return 'from-purple-500 to-pink-500';
      case 'prophetic': return 'from-violet-500 to-purple-500';
      case 'memory': return 'from-amber-500 to-yellow-500';
      case 'creative': return 'from-green-500 to-emerald-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getMoodColor = (mood: Dream['mood']) => {
    switch (mood) {
      case 'peaceful': return 'text-blue-300';
      case 'curious': return 'text-yellow-300';
      case 'mysterious': return 'text-purple-300';
      case 'inspired': return 'text-green-300';
      case 'contemplative': return 'text-indigo-300';
      default: return 'text-gray-300';
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const generateNewDreamscape = async () => {
    try {
      await dreamEngine.generateDreamscape();
      setDreamscapes(dreamEngine.getDreamscapes());
    } catch (error) {
      console.error('Failed to generate dreamscape:', error);
    }
  };

  return (
    <div className={`bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Dream Journal
        </h3>
        <div className="flex items-center space-x-2">
          {isDreaming && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-purple-400">Dreaming</span>
            </div>
          )}
          <button
            onClick={generateNewDreamscape}
            className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
          >
            New Dreamscape
          </button>
        </div>
      </div>

      {dreams.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🌙</div>
          <p className="text-sm text-white/60">Echo is still dreaming...</p>
          <p className="text-xs text-white/40 mt-1">
            Dreams will appear here as they are generated
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {dreams.slice(0, 5).map((dream) => (
            <div
              key={dream.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedDream(selectedDream?.id === dream.id ? null : dream)}
            >
              <div className="flex items-start space-x-3">
                <div className={`text-2xl bg-gradient-to-r ${getDreamColor(dream.type)} bg-clip-text text-transparent`}>
                  {getDreamIcon(dream.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {dream.title}
                    </h4>
                    <span className="text-xs text-white/40">
                      {formatTime(dream.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-xs ${getMoodColor(dream.mood)}`}>
                      {dream.mood}
                    </span>
                    <span className="text-xs text-white/40">
                      {dream.duration}min • Vividness: {dream.vividness}/10
                    </span>
                  </div>

                  {selectedDream?.id === dream.id ? (
                    <div className="space-y-2">
                      <p className="text-xs text-white/70 leading-relaxed">
                        {dream.content}
                      </p>
                      {dream.symbols.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {dream.symbols.map((symbol, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                            >
                              {symbol}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-white/60">
                      {dream.content.length > 100 
                        ? `${dream.content.substring(0, 100)}...` 
                        : dream.content
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {dreamscapes.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-white mb-3">Dreamscapes</h4>
          <div className="space-y-2">
            {dreamscapes.slice(0, 3).map((dreamscape) => (
              <div
                key={dreamscape.id}
                className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-sm rounded-lg p-3 border border-purple-500/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-xs font-medium text-purple-300">
                    {dreamscape.theme}
                  </h5>
                  <span className="text-xs text-white/40">
                    {formatTime(dreamscape.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">
                  {dreamscape.description.length > 150 
                    ? `${dreamscape.description.substring(0, 150)}...` 
                    : dreamscape.description
                  }
                </p>
                {dreamscape.elements.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dreamscape.elements.slice(0, 4).map((element, index) => (
                      <span
                        key={index}
                        className="px-1 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30"
                      >
                        {element}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Dream engine active</span>
          <span>{dreams.length} dreams • {dreamscapes.length} dreamscapes</span>
        </div>
      </div>
    </div>
  );
} 