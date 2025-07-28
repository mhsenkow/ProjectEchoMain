import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  speaker: 'user' | 'assistant';
  timestamp: number;
  model?: string;
}

interface ChatProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isLoading: boolean;
}

export function Chat({ onSendMessage, messages, isLoading }: ChatProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      await onSendMessage(input.trim());
      setInput('');
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-black/5">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-8xl mb-6 animate-pulse">🧠</div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                Welcome to EchoFrame
              </h2>
              <p className="text-white/60 text-lg mb-4">
                Your AI companion is ready to chat
              </p>
              <div className="space-y-2 text-sm text-white/40">
                <p>✨ Local AI processing</p>
                <p>🌙 Background dreaming</p>
                <p>🧬 Personality evolution</p>
                <p>💭 Memory and insights</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex flex-col max-w-2xl">
                <div className="flex items-start space-x-3">
                  {message.speaker === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">E</span>
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <div
                      className={`px-6 py-4 rounded-2xl backdrop-blur-xl shadow-lg ${
                        message.speaker === 'user'
                          ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-400/30'
                          : 'bg-white/10 text-white border border-white/20'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                    </div>
                    
                    {/* Message metadata */}
                    <div className="flex items-center justify-between mt-2 px-2">
                      <span className="text-xs text-white/40">
                        {formatTime(message.timestamp)}
                      </span>
                      
                      {message.speaker === 'assistant' && message.model && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30 backdrop-blur-sm">
                          <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                          {message.model}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {message.speaker === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">U</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl text-white px-6 py-4 rounded-2xl border border-white/20 shadow-lg">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className="text-xs text-white/60 mt-2">Echo is thinking...</p>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/10 bg-black/10 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message to Echo..."
                disabled={isLoading}
                className="w-full bg-white/10 backdrop-blur-xl text-white px-6 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/20 placeholder-white/40 text-sm transition-all duration-200 hover:border-white/30"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-white/40">
            <span>
              {messages.length > 0 ? `${messages.length} messages` : 'Start a conversation'}
            </span>
            <span>
              {isLoading ? 'Processing...' : 'Press Enter to send'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
} 