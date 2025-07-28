import React, { useState, useEffect } from 'react';
import { backgroundProcessor, BackgroundInsight } from '../../engine/backgroundProcessor';

interface BackgroundInsightsProps {
  className?: string;
}

export function BackgroundInsights({ className = '' }: BackgroundInsightsProps) {
  const [insights, setInsights] = useState<BackgroundInsight[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Start background processing when component mounts
    backgroundProcessor.startProcessing();
    backgroundProcessor.scheduleRecurringTasks();

    const interval = setInterval(() => {
      setInsights(backgroundProcessor.getRecentInsights(24));
      setIsProcessing(backgroundProcessor.getTasks().some(t => t.status === 'running'));
    }, 5000);

    return () => {
      clearInterval(interval);
      backgroundProcessor.stopProcessing();
    };
  }, []);

  const getInsightIcon = (type: BackgroundInsight['type']) => {
    switch (type) {
      case 'pattern': return '🔍';
      case 'synthesis': return '🧠';
      case 'learning': return '📚';
      case 'reflection': return '💭';
      case 'dreaming': return '✨';
      case 'connection': return '🔗';
      case 'prediction': return '🔮';
      case 'suggestion': return '💡';
      case 'memory': return '🧩';
      default: return '📝';
    }
  };

  const getInsightColor = (type: BackgroundInsight['type']) => {
    switch (type) {
      case 'pattern': return 'from-blue-500 to-cyan-500';
      case 'synthesis': return 'from-purple-500 to-pink-500';
      case 'learning': return 'from-green-500 to-emerald-500';
      case 'reflection': return 'from-indigo-500 to-purple-500';
      case 'dreaming': return 'from-yellow-500 to-orange-500';
      case 'connection': return 'from-teal-500 to-cyan-500';
      case 'prediction': return 'from-violet-500 to-purple-500';
      case 'suggestion': return 'from-amber-500 to-yellow-500';
      case 'memory': return 'from-slate-500 to-gray-500';
      default: return 'from-gray-500 to-gray-600';
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

  return (
    <div className={`bg-black/20 backdrop-blur-xl rounded-2xl p-4 border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          Echo's Thoughts
        </h3>
        <div className="flex items-center space-x-2">
          {isProcessing && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Processing</span>
            </div>
          )}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-white/60 hover:text-white/80 transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      {insights.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🤔</div>
          <p className="text-sm text-white/60">Echo is still thinking...</p>
          <p className="text-xs text-white/40 mt-1">
            Background processing will start generating insights soon
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.slice(0, showDetails ? 10 : 3).map((insight) => (
            <div
              key={insight.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className={`text-2xl bg-gradient-to-r ${getInsightColor(insight.type)} bg-clip-text text-transparent`}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {insight.title}
                    </h4>
                    <span className="text-xs text-white/40">
                      {formatTime(insight.timestamp)}
                    </span>
                  </div>
                  
                  {showDetails ? (
                    <p className="text-xs text-white/70 leading-relaxed mb-2">
                      {insight.content.length > 300 
                        ? `${insight.content.substring(0, 300)}...` 
                        : insight.content
                      }
                    </p>
                  ) : (
                    <p className="text-xs text-white/60">
                      {insight.content.length > 100 
                        ? `${insight.content.substring(0, 100)}...` 
                        : insight.content
                      }
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      {insight.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-white/40">
                        {Math.round(insight.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {insights.length > 3 && !showDetails && (
        <div className="mt-3 text-center">
          <button
            onClick={() => setShowDetails(true)}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            Show {insights.length - 3} more insights
          </button>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Background processing active</span>
          <span>{insights.length} insights generated</span>
        </div>
      </div>
    </div>
  );
} 