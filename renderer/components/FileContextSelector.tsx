import React, { useState } from 'react';

export interface FileContext {
  path: string;
  content: string;
  type: string;
  size: number;
  lastModified: Date;
}

export interface FolderContext {
  path: string;
  files: FileContext[];
  totalSize: number;
  fileCount: number;
}

// Function to read a single file
async function readFileContext(filePath: string): Promise<FolderContext> {
  try {
    console.log('[RENDERER] Attempting to read file:', filePath);
    console.log('[RENDERER] electronAPI available:', !!(window as any).electronAPI);
    
    const result = await (window as any).electronAPI?.invoke('read-file-context', filePath);
    
    console.log('[RENDERER] IPC result:', result);
    
    if (result?.success) {
      console.log('[RENDERER] File read successfully, content length:', result.data.files[0]?.content?.length);
      return result.data;
    } else {
      console.error('[RENDERER] IPC returned error:', result?.error);
      throw new Error(result?.error || 'Failed to read file');
    }
  } catch (error) {
    console.error('[RENDERER] Error reading file context:', error);
    throw error;
  }
}

// Function to read a folder
async function readFolderContext(folderPath: string, maxFiles: number = 50): Promise<FolderContext> {
  try {
    console.log('[RENDERER] Attempting to read folder:', folderPath);
    console.log('[RENDERER] electronAPI available:', !!(window as any).electronAPI);
    
    const result = await (window as any).electronAPI?.invoke('read-folder-context', folderPath, maxFiles);
    
    console.log('[RENDERER] IPC result:', result);
    
    if (result?.success) {
      console.log('[RENDERER] Folder read successfully, files count:', result.data.files?.length);
      return result.data;
    } else {
      console.error('[RENDERER] IPC returned error:', result?.error);
      throw new Error(result?.error || 'Failed to read folder');
    }
  } catch (error) {
    console.error('[RENDERER] Error reading folder context:', error);
    throw error;
  }
}

// Function to get folder summary
function getFolderSummary(folderContext: FolderContext): string {
  const fileTypes = folderContext.files.reduce((acc, file) => {
    acc[file.type] = (acc[file.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  let summary = `Folder: ${folderContext.path}\n`;
  summary += `Files: ${folderContext.fileCount}\n`;
  summary += `Size: ${(folderContext.totalSize / 1024).toFixed(2)} KB\n`;
  summary += `File types: ${Object.entries(fileTypes).map(([type, count]) => `${type}(${count})`).join(', ')}\n`;
  
  return summary;
}

interface FileContextSelectorProps {
  onContextChange: (context: FolderContext | null) => void;
  currentContext: FolderContext | null;
}

export function FileContextSelector({ onContextChange, currentContext }: FileContextSelectorProps) {
  const [selectedPath, setSelectedPath] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'folder' | 'file'>('folder');

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPath(e.target.value);
    setError(null);
  };

  const handleLoadContext = async () => {
    if (!selectedPath.trim()) {
      setError(`Please enter a ${mode} path`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const context = mode === 'folder' 
        ? await readFolderContext(selectedPath)
        : await readFileContext(selectedPath);
      onContextChange(context);
    } catch (err) {
      setError(`Failed to load ${mode}: ${err}`);
      onContextChange(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearContext = () => {
    onContextChange(null);
    setSelectedPath('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          📁 File Context
        </h3>
        
        {/* Mode Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">Select Mode</label>
          <div className="flex space-x-2">
            <button
              onClick={() => setMode('folder')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm transition-all ${
                mode === 'folder'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              📂 Folder
            </button>
            <button
              onClick={() => setMode('file')}
              className={`flex-1 px-4 py-2 rounded-xl text-sm transition-all ${
                mode === 'file'
                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              📄 Single File
            </button>
          </div>
        </div>
        
        {/* Path Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            {mode === 'folder' ? 'Folder Path' : 'File Path'}
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              value={selectedPath}
              onChange={handlePathChange}
              placeholder={mode === 'folder' ? "/Users/username/projects/my-project" : "/Users/username/Downloads/document.pdf"}
              className="flex-1 bg-white/10 backdrop-blur-xl text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/50 border border-white/20 placeholder-gray-400"
            />
            <button
              onClick={handleLoadContext}
              disabled={isLoading || !selectedPath.trim()}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-blue-600 disabled:opacity-50 backdrop-blur-xl border border-green-400/30"
            >
              {isLoading ? '🔄' : mode === 'folder' ? '📂 Load' : '📄 Load'}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {mode === 'folder' 
              ? 'Enter a folder path to include its files in the conversation context'
              : 'Enter a file path to include it in the conversation context'
            }
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="text-red-400 bg-red-900/20 p-4 rounded-xl border border-red-500/30 mb-4">
            ❌ {error}
          </div>
        )}

        {/* Current Context Display */}
        {currentContext && (
          <div className="bg-green-900/20 p-4 rounded-xl border border-green-500/30">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-medium text-green-400">✅ Active Context</h4>
              <button
                onClick={handleClearContext}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                ✕ Clear
              </button>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <div><strong>Path:</strong> {currentContext.path}</div>
              <div><strong>Files:</strong> {currentContext.fileCount}</div>
              <div><strong>Size:</strong> {(currentContext.totalSize / 1024).toFixed(2)} KB</div>
              <div><strong>Types:</strong> {
                Object.entries(
                  currentContext.files.reduce((acc, file) => {
                    acc[file.type] = (acc[file.type] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([type, count]) => `${type}(${count})`).join(', ')
              }</div>
            </div>
          </div>
        )}

        {/* Quick Paths */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-300">Quick Paths</h4>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => {
                setMode('folder');
                setSelectedPath(process.env.HOME || '/Users');
              }}
              className="bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-xl hover:bg-white/20 border border-white/20 text-sm transition-all text-left"
            >
              🏠 Home Directory
            </button>
            <button
              onClick={() => {
                setMode('folder');
                setSelectedPath('/Users/powerox/projectEcho/echo-frame');
              }}
              className="bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-xl hover:bg-white/20 border border-white/20 text-sm transition-all text-left"
            >
              📂 Current Project
            </button>
            <button
              onClick={() => {
                setMode('file');
                setSelectedPath('main/my_atlas_who_carries_our_heaven.pdf');
              }}
              className="bg-white/10 backdrop-blur-xl text-white px-4 py-2 rounded-xl hover:bg-white/20 border border-white/20 text-sm transition-all text-left"
            >
              📄 Atlas PDF (Built-in)
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-gray-400 bg-black/20 p-3 rounded-lg">
          <p><strong>Supported files:</strong> .txt, .md, .js, .ts, .jsx, .tsx, .json, .py, .java, .cpp, .c, .h, .css, .html, .xml, .yaml, .yml, .toml, .ini, .cfg, .conf, .log, .pdf</p>
          <p><strong>Limits:</strong> Max 50 files, 10MB per file, excludes node_modules/.git</p>
          <p><strong>✅ PDF Support:</strong> Full PDF content extraction with metadata</p>
          <p><strong>📚 Built-in Content:</strong> "Atlas PDF" is included as part of EchoFrame for philosophical discussions</p>
        </div>
      </div>
    </div>
  );
}

export default FileContextSelector; 