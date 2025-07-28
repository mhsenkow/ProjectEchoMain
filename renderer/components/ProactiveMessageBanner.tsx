import React from 'react';
import { ProactiveMessage } from '../../engine/proactiveEngine';

interface ProactiveMessageBannerProps {
  message: ProactiveMessage;
  onRespond: (message: string) => void;
  onDismiss: () => void;
}

export function ProactiveMessageBanner({ message, onRespond, onDismiss }: ProactiveMessageBannerProps) {
  const getMessageIcon = (type: ProactiveMessage['type']) => {
    switch (type) {
      case 'greeting': return '👋';
      case 'insight_share': return '💡';
      case 'dream_share': return '🌙';
      case 'question': return '❓';
      case 'check_in': return '💭';
      case 'reflection': return '🪞';
      case 'curiosity': return '🤔';
      case 'inner_thoughts': return '🔮';
      default: return '💬';
    }
  };

  const getMessageColor = (type: ProactiveMessage['type']) => {
    switch (type) {
      case 'greeting': return 'from-blue-500 to-cyan-500';
      case 'insight_share': return 'from-purple-500 to-pink-500';
      case 'dream_share': return 'from-violet-500 to-purple-500';
      case 'question': return 'from-green-500 to-emerald-500';
      case 'check_in': return 'from-amber-500 to-yellow-500';
      case 'reflection': return 'from-indigo-500 to-purple-500';
      case 'curiosity': return 'from-teal-500 to-cyan-500';
      case 'inner_thoughts': return 'from-purple-500 to-violet-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleRespond = () => {
    onRespond(message.content);
    onDismiss();
  };

  return (
    <div className="relative">
      <div className={`bg-gradient-to-r ${getMessageColor(message.type)}/20 backdrop-blur-xl border border-white/20 rounded-2xl p-4 m-4 shadow-lg animate-in slide-in-from-top duration-500`}>
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{getMessageIcon(message.type)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-white">Echo wants to chat</h4>
                <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                  {message.type.replace('_', ' ')}
                </span>
              </div>
              <button
                onClick={onDismiss}
                className="text-white/60 hover:text-white/80 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <p className="text-sm text-white/90 leading-relaxed mb-3">
              {message.content}
            </p>
            
            <div className="flex space-x-2">
              <button
                onClick={handleRespond}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 text-sm font-medium"
              >
                💬 Respond
              </button>
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors text-sm"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 