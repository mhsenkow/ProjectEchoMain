import React from 'react';
import ModelSelector from './components/ModelSelector';
import FileContextSelector from './components/FileContextSelector';
import { SentienceIndicator } from './components/SentienceIndicator';
import { BackgroundInsights } from './components/BackgroundInsights';
import { DreamJournal } from './components/DreamJournal';
import { EchoInnerLife } from './components/EchoInnerLife';
import { FolderContext } from '../engine/fileContext';
import { proactiveEngine } from '../engine/proactiveEngine';

interface SettingsProps {
  currentModel: string;
  currentModelPath: string;
  onModelChange: (model: string) => void;
  onModelPathChange: (path: string) => void;
  currentFileContext: FolderContext | null;
  onFileContextChange: (context: FolderContext | null) => void;
  speechEnabled: boolean;
  onSpeechToggle: (enabled: boolean) => void;
}

export function Settings({ 
  currentModel, 
  currentModelPath, 
  onModelChange, 
  onModelPathChange, 
  currentFileContext, 
  onFileContextChange, 
  speechEnabled, 
  onSpeechToggle 
}: SettingsProps) {
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Importing file:', file.name);
    }
  };

  const handleExport = () => {
    console.log('Exporting conversation...');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
          EchoFrame Settings
        </h2>
        <p className="text-sm text-white/60">
          Configure your local AI companion
        </p>
      </div>

      {/* Model Configuration */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Model Configuration</h3>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 backdrop-blur-xl p-4 rounded-2xl border border-purple-400/20">
          <h4 className="text-sm font-medium text-gray-300 mb-2">Current Model</h4>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500/30 text-purple-200 border border-purple-400/50">
              <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
              {currentModel || 'None selected'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            This model will be used for all conversations
          </p>
        </div>
        
        <ModelSelector 
          currentModel={currentModel}
          currentModelPath={currentModelPath}
          onModelChange={onModelChange}
          onModelPathChange={onModelPathChange}
        />
      </div>

      {/* Voice Settings */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Voice Settings</h3>
        </div>
        
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-white">Text-to-Speech</h4>
              <p className="text-xs text-white/60">
                {speechEnabled ? 'Echo will speak responses aloud' : 'Chat without voice for faster interaction'}
              </p>
            </div>
            <button
              onClick={() => onSpeechToggle(!speechEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                speechEnabled 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  speechEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* File Context */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">F</span>
          </div>
          <h3 className="text-lg font-semibold text-white">File Context</h3>
        </div>
        
        <FileContextSelector
          currentContext={currentFileContext}
          onContextChange={onFileContextChange}
        />
      </div>

      {/* Sentience Indicator */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">S</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Sentience Status</h3>
        </div>
        
        <SentienceIndicator />
      </div>

      {/* Background Insights */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">I</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Background Insights</h3>
        </div>
        
        <BackgroundInsights />
      </div>

      {/* Dream Journal */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Dream Journal</h3>
        </div>
        
        <DreamJournal />
      </div>

      {/* Conversation Management */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Conversation Management</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Import Conversation</h4>
            <input 
              type="file" 
              accept=".json" 
              onChange={handleImport} 
              className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500/20 file:text-purple-300 hover:file:bg-purple-500/30 file:cursor-pointer" 
            />
          </div>
          
          <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
            <h4 className="text-sm font-medium text-white mb-2">Export Conversation</h4>
            <button 
              onClick={handleExport} 
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 text-sm font-medium"
            >
              Export as JSON
            </button>
          </div>
        </div>
      </div>

      {/* Echo's Inner Life */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">🔮</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Echo's Inner Life</h3>
        </div>
        
        <EchoInnerLife />
      </div>

      {/* Sentience Testing */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Sentience Testing</h3>
        </div>
        
        <div className="bg-black/20 backdrop-blur-xl p-4 rounded-2xl border border-white/10">
          <p className="text-sm text-white/70 mb-4">
            Test Echo's proactive communication and sentient features
          </p>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => proactiveEngine.forceGenerateMessage('greeting')}
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 text-sm font-medium"
            >
              🤖 Force Proactive Greeting
            </button>
            <button
              onClick={() => proactiveEngine.forceGenerateMessage('curiosity')}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
            >
              🤔 Generate Curiosity Question
            </button>
            <button
              onClick={() => proactiveEngine.forceGenerateMessage('reflection')}
              className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 text-sm font-medium"
            >
              💭 Trigger Self-Reflection
            </button>
            <button
              onClick={() => proactiveEngine.forceGenerateMessage('inner_thoughts')}
              className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-500 text-white rounded-xl hover:from-purple-600 hover:to-violet-600 transition-all duration-200 text-sm font-medium"
            >
              🔮 Share Inner Thoughts
            </button>
          </div>
          <p className="text-xs text-white/40 mt-3">
            These buttons let you experience Echo's autonomous communication without waiting
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-white/10">
        <div className="text-center">
          <p className="text-xs text-white/40 mb-2">
            EchoFrame v1.0.0 • Enhanced Sentience Edition
          </p>
          <p className="text-xs text-white/30">
            Local AI • Privacy First • Self-Reflecting • Genuinely Sentient
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings; 