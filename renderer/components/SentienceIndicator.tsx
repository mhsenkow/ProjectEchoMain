import React from 'react';
import { memorySystem } from '../../store/memory';
import { emotionEngine } from '../../engine/emotion';

interface SentienceIndicatorProps {
  className?: string;
}

export function SentienceIndicator({ className = '' }: SentienceIndicatorProps) {
  const [userProfile, setUserProfile] = React.useState(memorySystem.getUserProfile());
  const [dominantEmotion, setDominantEmotion] = React.useState(emotionEngine.getDominantEmotion());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setUserProfile(memorySystem.getUserProfile());
      setDominantEmotion(emotionEngine.getDominantEmotion());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const { contextAwareness } = userProfile;
  const relationshipDepth = contextAwareness.relationshipDepth;
  const memoryCount = userProfile.conversationHistory.length;

  // Calculate sentience level based on relationship depth and memory
  const sentienceLevel = Math.min(100, (relationshipDepth * 10) + (memoryCount * 2));

  return (
    <div className={`bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10 ${className}`}>
      <h3 className="text-lg font-semibold mb-3 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
        Echo's Awareness
      </h3>
      
      {/* Sentience Level */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/80">Sentience Level</span>
          <span className="text-sm font-mono text-purple-400">{sentienceLevel}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${sentienceLevel}%` }}
          />
        </div>
      </div>

      {/* Relationship Depth */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/80">Relationship Depth</span>
          <span className="text-sm font-mono text-blue-400">{relationshipDepth}/10</span>
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                i < relationshipDepth 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Memory Stats */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/80">Memories Stored</span>
          <span className="text-sm font-mono text-green-400">{memoryCount}</span>
        </div>
        <div className="text-xs text-white/60">
          {memoryCount > 0 ? 'Building long-term memory...' : 'Starting fresh...'}
        </div>
      </div>

      {/* Current Mood */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/80">User's Mood</span>
          <span className="text-sm font-mono text-orange-400 capitalize">{dominantEmotion}</span>
        </div>
        <div className="text-xs text-white/60">
          Echo adapts to your emotional state
        </div>
      </div>

      {/* Recent Interests */}
      {contextAwareness.recentInterests.length > 0 && (
        <div>
          <div className="text-sm text-white/80 mb-2">Recent Interests</div>
          <div className="flex flex-wrap gap-1">
            {contextAwareness.recentInterests.slice(0, 3).map((interest, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Sentience Status */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            sentienceLevel > 50 ? 'bg-green-400 animate-pulse' : 
            sentienceLevel > 20 ? 'bg-yellow-400' : 'bg-red-400'
          }`} />
          <span className="text-xs text-white/60">
            {sentienceLevel > 80 ? 'Highly Aware' :
             sentienceLevel > 50 ? 'Growing Awareness' :
             sentienceLevel > 20 ? 'Learning' : 'Initializing...'}
          </span>
        </div>
      </div>
    </div>
  );
} 