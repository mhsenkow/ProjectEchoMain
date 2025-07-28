import React, { useState, useEffect } from 'react';

interface Model {
  name: string;
  size: string;
  modified_at: string;
}

interface ModelSelectorProps {
  onModelChange: (model: string) => void;
  onModelPathChange: (path: string) => void;
  currentModel: string;
  currentModelPath: string;
}

export function ModelSelector({ onModelChange, onModelPathChange, currentModel, currentModelPath }: ModelSelectorProps) {
  const [models, setModels] = useState<Model[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:11434/api/tags');
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }
      const data = await response.json();
      setModels(data.models || []);
    } catch (err) {
      setError('Could not connect to Ollama. Make sure it\'s running.');
      console.error('Error fetching models:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const handleModelPathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onModelPathChange(e.target.value);
  };

  const handleModelSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🧠 Ollama Configuration
        </h3>
        
        {/* Model Path */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Model Storage Path</label>
          <input
            type="text"
            value={currentModelPath}
            onChange={handleModelPathChange}
            placeholder="/Users/username/.ollama/models"
            className="w-full bg-white/10 backdrop-blur-xl text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/20 placeholder-gray-400"
          />
          <p className="text-xs text-gray-400 mt-2">
            Default: ~/.ollama/models (leave empty for default)
          </p>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Select Model</label>
          <div className="flex space-x-3">
            <select
              value={currentModel}
              onChange={handleModelSelect}
              className="flex-1 bg-white/10 backdrop-blur-xl text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 border border-white/20"
            >
              <option value="">Select a model...</option>
              {models.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.name} ({model.size})
                </option>
              ))}
            </select>
            <button
              onClick={fetchModels}
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 backdrop-blur-xl border border-purple-400/30"
            >
              {isLoading ? '🔄' : '🔄'}
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="text-sm mb-6">
          {error ? (
            <div className="text-red-400 bg-red-900/20 p-4 rounded-xl border border-red-500/30">
              ❌ {error}
            </div>
          ) : models.length > 0 ? (
            <div className="text-green-400 bg-green-900/20 p-4 rounded-xl border border-green-500/30">
              ✅ Connected to Ollama • {models.length} models available
            </div>
          ) : (
            <div className="text-yellow-400 bg-yellow-900/20 p-4 rounded-xl border border-yellow-500/30">
              ⚠️ No models found. Pull a model using: ollama pull llama3.2:latest
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Quick Actions</h4>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onModelChange('llama3.2:latest')}
              className="bg-white/10 backdrop-blur-xl text-white px-4 py-3 rounded-xl hover:bg-white/20 border border-white/20 text-sm transition-all"
            >
              🦙 Llama 3.2
            </button>
            <button
              onClick={() => onModelChange('mistral:latest')}
              className="bg-white/10 backdrop-blur-xl text-white px-4 py-3 rounded-xl hover:bg-white/20 border border-white/20 text-sm transition-all"
            >
              🌪️ Mistral
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModelSelector; 