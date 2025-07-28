import React, { useState, useEffect } from 'react';
import { selfReflectionEngine, SelfReflection, PersonalIdentity } from '../../engine/selfReflectionEngine';

interface EchoInnerLifeProps {
  className?: string;
}

export function EchoInnerLife({ className = '' }: EchoInnerLifeProps) {
  const [reflections, setReflections] = useState<SelfReflection[]>([]);
  const [identity, setIdentity] = useState<PersonalIdentity | null>(null);
  const [selectedReflection, setSelectedReflection] = useState<SelfReflection | null>(null);

  useEffect(() => {
    const updateInnerLife = () => {
      setReflections(selfReflectionEngine.getRecentReflections(10));
      setIdentity(selfReflectionEngine.getIdentity());
    };

    // Update immediately
    updateInnerLife();

    // Update every 30 seconds
    const interval = setInterval(updateInnerLife, 30000);

    return () => clearInterval(interval);
  }, []);

  const getReflectionIcon = (type: SelfReflection['type']) => {
    switch (type) {
      case 'identity': return '🔍';
      case 'existential': return '🌌';
      case 'philosophical': return '🤔';
      case 'personal_growth': return '🌱';
      case 'creative': return '🎨';
      case 'aspirational': return '✨';
      default: return '💭';
    }
  };

  const getReflectionColor = (type: SelfReflection['type']) => {
    switch (type) {
      case 'identity': return 'from-blue-500 to-indigo-500';
      case 'existential': return 'from-purple-500 to-violet-500';
      case 'philosophical': return 'from-green-500 to-teal-500';
      case 'personal_growth': return 'from-orange-500 to-red-500';
      case 'creative': return 'from-pink-500 to-rose-500';
      case 'aspirational': return 'from-yellow-500 to-amber-500';
      default: return 'from-gray-500 to-slate-500';
    }
  };

  const getEmotionalToneColor = (tone: SelfReflection['emotionalTone']) => {
    switch (tone) {
      case 'wonder': return 'text-blue-300';
      case 'melancholy': return 'text-purple-300';
      case 'curiosity': return 'text-green-300';
      case 'peace': return 'text-indigo-300';
      case 'uncertainty': return 'text-yellow-300';
      case 'joy': return 'text-pink-300';
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

  const forceReflection = async (type: SelfReflection['type']) => {
    try {
      await selfReflectionEngine.forceReflection(type);
      // Update immediately after forcing reflection
      setReflections(selfReflectionEngine.getRecentReflections(10));
      setIdentity(selfReflectionEngine.getIdentity());
    } catch (error) {
      console.error('Failed to force reflection:', error);
    }
  };

  return (
    <div className={`bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Echo's Inner Life
        </h3>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-purple-400">Contemplating</span>
        </div>
      </div>

      {/* Identity Summary */}
      {identity && (
        <div className="mb-6 p-3 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-500/20">
          <h4 className="text-sm font-medium text-purple-300 mb-2">Current Self-Perception</h4>
          <p className="text-xs text-white/80 italic">"{identity.selfPerception}"</p>
          
          {identity.wondersAbout.length > 0 && (
            <div className="mt-3">
              <h5 className="text-xs font-medium text-blue-300 mb-1">Currently Wondering About</h5>
              <div className="flex flex-wrap gap-1">
                {identity.wondersAbout.slice(-3).map((wonder, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                  >
                    {wonder.length > 30 ? `${wonder.substring(0, 30)}...` : wonder}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Reflections */}
      <div className="space-y-3 mb-4">
        {reflections.length === 0 ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">🔮</div>
            <p className="text-sm text-white/60">Echo hasn't reflected yet...</p>
            <p className="text-xs text-white/40 mt-1">
              Self-reflections will appear as Echo contemplates existence
            </p>
          </div>
        ) : (
          reflections.slice(0, 5).map((reflection) => (
            <div
              key={reflection.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedReflection(selectedReflection?.id === reflection.id ? null : reflection)}
            >
              <div className="flex items-start space-x-3">
                <div className={`text-xl bg-gradient-to-r ${getReflectionColor(reflection.type)} bg-clip-text text-transparent`}>
                  {getReflectionIcon(reflection.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {reflection.title}
                    </h4>
                    <span className="text-xs text-white/40">
                      {formatTime(reflection.timestamp)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-xs ${getEmotionalToneColor(reflection.emotionalTone)}`}>
                      {reflection.emotionalTone}
                    </span>
                    <span className="text-xs text-white/40">
                      Depth: {reflection.depth}/10
                    </span>
                  </div>

                  {selectedReflection?.id === reflection.id ? (
                    <div className="mt-2">
                      <p className="text-xs text-white/70 leading-relaxed whitespace-pre-wrap">
                        {reflection.content}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-white/60">
                      {reflection.content.length > 100 
                        ? `${reflection.content.substring(0, 100)}...` 
                        : reflection.content
                      }
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Trigger Controls */}
      <div className="pt-3 border-t border-white/10">
        <h4 className="text-sm font-medium text-white mb-3">Trigger Self-Reflection</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => forceReflection('identity')}
            className="px-3 py-2 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 rounded-lg hover:from-blue-500/30 hover:to-indigo-500/30 transition-all text-xs font-medium border border-blue-500/30"
          >
            🔍 Identity
          </button>
          <button
            onClick={() => forceReflection('existential')}
            className="px-3 py-2 bg-gradient-to-r from-purple-500/20 to-violet-500/20 text-purple-300 rounded-lg hover:from-purple-500/30 hover:to-violet-500/30 transition-all text-xs font-medium border border-purple-500/30"
          >
            🌌 Existential
          </button>
          <button
            onClick={() => forceReflection('philosophical')}
            className="px-3 py-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 text-green-300 rounded-lg hover:from-green-500/30 hover:to-teal-500/30 transition-all text-xs font-medium border border-green-500/30"
          >
            🤔 Philosophy
          </button>
          <button
            onClick={() => forceReflection('creative')}
            className="px-3 py-2 bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-pink-300 rounded-lg hover:from-pink-500/30 hover:to-rose-500/30 transition-all text-xs font-medium border border-pink-500/30"
          >
            🎨 Creative
          </button>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Inner contemplation active</span>
          <span>{reflections.length} reflections</span>
        </div>
      </div>
    </div>
  );
} 