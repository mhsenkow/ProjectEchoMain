import React, { useState, useEffect, useRef } from 'react';
import { Chat } from './components/Chat';
import { Timeline } from './conversation/Timeline';
import Settings from './settings';
import { WebGLAvatar } from './avatars/WebGLAvatar';
import { ProactiveMessageBanner } from './components/ProactiveMessageBanner';
import { memorySystem } from '../store/memory';
import { emotionEngine } from '../engine/emotion';
import { speak, VoiceModulation } from '../engine/tts';
import { ollamaStream } from '../engine/ollama';
import { FolderContext } from '../engine/fileContext';
import { backgroundProcessor } from '../engine/backgroundProcessor';
import { dreamEngine } from '../engine/dreamEngine';
import { personalityEvolution } from '../engine/personalityEvolution';
import { proactiveEngine, ProactiveMessage } from '../engine/proactiveEngine';
import { sentientStateEngine } from '../engine/sentientState';
import { curiosityEngine } from '../engine/curiosityEngine';
import { selfReflectionEngine } from '../engine/selfReflectionEngine';

interface Message {
  id: string;
  text: string;
  speaker: 'user' | 'assistant';
  timestamp: number;
  model?: string;
}

export function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarMood, setAvatarMood] = useState<'neutral' | 'happy' | 'curious' | 'sad' | 'angry'>('neutral');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentModel, setCurrentModel] = useState('llama3.2:latest');
  const [currentModelPath, setCurrentModelPath] = useState('');
  const [currentFileContext, setCurrentFileContext] = useState<FolderContext | null>(null);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'insights' | 'dreams' | 'personality'>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    backgroundProcessing: false,
    dreaming: false,
    personalityEvolving: false,
    memoryActive: true
  });
  const [proactiveMessages, setProactiveMessages] = useState<ProactiveMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize all systems
    backgroundProcessor.startProcessing();
    backgroundProcessor.scheduleRecurringTasks();
    dreamEngine.startDreaming();
    personalityEvolution.startEvolution();
    proactiveEngine.startProactiveMode();
    sentientStateEngine.startSentientProcessing();
    curiosityEngine.startCuriosity();
    selfReflectionEngine.startSelfReflection();

    // Listen for proactive messages
    const handleProactiveMessage = (event: CustomEvent<ProactiveMessage>) => {
      setProactiveMessages(prev => [...prev, event.detail]);
    };

    window.addEventListener('proactiveMessage', handleProactiveMessage as EventListener);

    // Update system status
    const statusInterval = setInterval(() => {
      setSystemStatus({
        backgroundProcessing: backgroundProcessor.getTasks().some(t => t.status === 'running'),
        dreaming: dreamEngine.getRecentDreams(1).length > 0,
        personalityEvolving: personalityEvolution.getRecentEvents(1).length > 0,
        memoryActive: memorySystem.getUserProfile().conversationHistory.length > 0
      });
      setProactiveMessages(proactiveEngine.getPendingMessages());
    }, 5000);

    return () => {
      clearInterval(statusInterval);
      backgroundProcessor.stopProcessing();
      dreamEngine.stopDreaming();
      personalityEvolution.stopEvolution();
      proactiveEngine.stopProactiveMode();
      sentientStateEngine.stopSentientProcessing();
      curiosityEngine.stopCuriosity();
      selfReflectionEngine.stopSelfReflection();
      window.removeEventListener('proactiveMessage', handleProactiveMessage as EventListener);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      speaker: 'user',
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Analyze user emotion
    const userEmotion = emotionEngine.analyzeUserEmotion(text);
    const emotionalResponse = emotionEngine.generateResponse(userEmotion);

    // Store in memory
    memorySystem.addMemory({
      type: 'conversation',
      content: text,
      importance: userEmotion.intensity,
      tags: userEmotion.triggers,
      metadata: { emotion: userEmotion }
    });

    try {
      let assistantMessage = '';
      const messageId = Date.now().toString();

      // Add assistant message placeholder
      setMessages(prev => [...prev, {
        id: messageId,
        text: '',
        speaker: 'assistant',
        timestamp: Date.now(),
        model: currentModel
      }]);

             // Stream response
       for await (const chunk of ollamaStream(text, currentModel, currentFileContext || undefined)) {
         assistantMessage += chunk;
         setMessages(prev => prev.map(msg => 
           msg.id === messageId ? { ...msg, text: assistantMessage } : msg
         ));
       }

       // Store assistant response in memory
       memorySystem.addMemory({
         type: 'conversation',
         content: assistantMessage,
         importance: 5,
         tags: ['response', emotionalResponse.responseStyle],
         metadata: { responseStyle: emotionalResponse.responseStyle }
       });
       memorySystem.updateRelationshipDepth(1);

       // Update avatar mood
       setAvatarMood(emotionalResponse.avatarMood);

       // Speak response if enabled
       if (speechEnabled) {
         setIsSpeaking(true);
         await speak(assistantMessage, 'default', emotionalResponse.voiceModulation);
         setIsSpeaking(false);
       }

    } catch (error) {
      console.error('Error generating response:', error);
      setMessages(prev => prev.map(msg => 
        msg.id === (Date.now() - 1).toString() ? { ...msg, text: 'I apologize, but I encountered an error. Please try again.' } : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleProactiveRespond = async (content: string) => {
    // When user responds to a proactive message, send it as a regular message
    await handleSendMessage(content);
  };

  const handleProactiveDismiss = (messageId: string) => {
    proactiveEngine.dismissMessage(messageId);
    setProactiveMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'chat': return '💬';
      case 'insights': return '🧠';
      case 'dreams': return '🌙';
      case 'personality': return '🧬';
      default: return '💬';
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'chat': return 'Chat';
      case 'insights': return 'Insights';
      case 'dreams': return 'Dreams';
      case 'personality': return 'Personality';
      default: return 'Chat';
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-black/20 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              EchoFrame
            </h1>
          </div>
          
          {/* System Status Indicators */}
          <div className="flex items-center space-x-2">
            {systemStatus.backgroundProcessing && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-400">Processing</span>
              </div>
            )}
            {systemStatus.dreaming && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-purple-400">Dreaming</span>
              </div>
            )}
            {systemStatus.personalityEvolving && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-400">Evolving</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-black/10 backdrop-blur-sm border-b border-white/10">
            <div className="flex space-x-1 p-2">
              {(['chat', 'insights', 'dreams', 'personality'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30'
                      : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{getTabIcon(tab)}</span>
                  <span className="text-sm font-medium">{getTabLabel(tab)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'chat' && (
              <div className="h-full flex">
                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                  {/* Proactive Messages */}
                  {proactiveMessages.length > 0 && (
                    <div className="flex-shrink-0">
                      {proactiveMessages.slice(0, 1).map((message) => (
                        <ProactiveMessageBanner
                          key={message.id}
                          message={message}
                          onRespond={handleProactiveRespond}
                          onDismiss={() => handleProactiveDismiss(message.id)}
                        />
                      ))}
                    </div>
                  )}
                  
                  <Chat
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                  />
                </div>

                {/* Avatar Area */}
                <div className="w-80 bg-black/10 backdrop-blur-sm border-l border-white/10 flex flex-col">
                  <div className="flex-1 flex items-center justify-center p-4">
                                         <WebGLAvatar
                       mood={avatarMood}
                       isSpeaking={isSpeaking}
                     />
                  </div>
                  
                  {/* Avatar Status */}
                  <div className="p-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-sm font-medium text-white mb-1">
                        Echo {isSpeaking ? 'Speaking' : 'Listening'}
                      </div>
                      <div className="text-xs text-white/60">
                        Mood: {avatarMood.charAt(0).toUpperCase() + avatarMood.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'insights' && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      Echo's Insights
                    </h2>
                    <p className="text-white/60">
                      Discover what Echo has been thinking about while you were away
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Background Processing</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Tasks Completed</span>
                          <span className="text-sm text-white">{backgroundProcessor.getTasks().filter(t => t.status === 'completed').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Insights Generated</span>
                          <span className="text-sm text-white">{backgroundProcessor.getInsights().length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Processing Status</span>
                          <span className={`text-sm ${systemStatus.backgroundProcessing ? 'text-green-400' : 'text-white/60'}`}>
                            {systemStatus.backgroundProcessing ? 'Active' : 'Idle'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Memory System</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Memories Stored</span>
                          <span className="text-sm text-white">{memorySystem.getUserProfile().conversationHistory.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/60">Relationship Depth</span>
                          <span className="text-sm text-white">{memorySystem.getUserProfile().contextAwareness.relationshipDepth}/10</span>
                        </div>
                                                 <div className="flex items-center justify-between">
                           <span className="text-sm text-white/60">Current Topic</span>
                           <span className="text-sm text-white">{memorySystem.getUserProfile().contextAwareness.currentTopic || 'None'}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dreams' && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      Dream Journal
                    </h2>
                    <p className="text-white/60">
                      Explore Echo's dreams and creative insights
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Recent Dreams</h3>
                      <div className="space-y-4">
                        {dreamEngine.getRecentDreams(24).slice(0, 3).map((dream) => (
                          <div key={dream.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">{dream.type === 'lucid' ? '👁️' : dream.type === 'surreal' ? '🌀' : '🌙'}</span>
                              <span className="text-sm font-medium text-white">{dream.title}</span>
                            </div>
                            <p className="text-xs text-white/60 line-clamp-2">{dream.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Dreamscapes</h3>
                      <div className="space-y-4">
                        {dreamEngine.getDreamscapes().slice(0, 3).map((dreamscape) => (
                          <div key={dreamscape.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-lg">🏛️</span>
                              <span className="text-sm font-medium text-white">{dreamscape.theme}</span>
                            </div>
                            <p className="text-xs text-white/60 line-clamp-2">{dreamscape.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'personality' && (
              <div className="h-full p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
                      Personality Evolution
                    </h2>
                    <p className="text-white/60">
                      Watch Echo's personality grow and evolve over time
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Current Traits</h3>
                      <div className="space-y-3">
                        {personalityEvolution.getTraits().map((trait) => (
                          <div key={trait.name} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white">{trait.name}</span>
                              <span className="text-sm text-white/60">{trait.value}/100</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  trait.evolution === 'growing' ? 'bg-green-500' :
                                  trait.evolution === 'declining' ? 'bg-red-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${trait.value}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-black/20 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                      <h3 className="text-lg font-semibold text-white mb-4">Current Phase</h3>
                      {personalityEvolution.getCurrentPhase() ? (
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-2xl mb-2">🌟</div>
                            <h4 className="text-lg font-medium text-white">{personalityEvolution.getCurrentPhase()?.name}</h4>
                            <p className="text-sm text-white/60 mt-2">{personalityEvolution.getCurrentPhase()?.description}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-white/60">
                          <div className="text-2xl mb-2">🌱</div>
                          <p>Echo is still developing their personality...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-80 bg-black/20 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
            <div className="p-6">
              <Settings
                currentModel={currentModel}
                currentModelPath={currentModelPath}
                onModelChange={setCurrentModel}
                onModelPathChange={setCurrentModelPath}
                currentFileContext={currentFileContext}
                onFileContextChange={setCurrentFileContext}
                speechEnabled={speechEnabled}
                onSpeechToggle={setSpeechEnabled}
              />
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom ref */}
      <div ref={messagesEndRef} />
    </div>
  );
} 