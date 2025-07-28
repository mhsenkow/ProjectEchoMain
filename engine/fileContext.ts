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

/**
 * Reads a folder context using Electron's IPC
 */
export async function readFolderContext(folderPath: string, maxFiles: number = 50): Promise<FolderContext> {
  try {
    // Use Electron's IPC to communicate with the main process
    const result = await (window as any).electronAPI?.invoke('read-folder-context', folderPath, maxFiles);
    
    if (result?.success) {
      return result.data;
    } else {
      throw new Error(result?.error || 'Failed to read folder');
    }
  } catch (error) {
    console.error('Error reading folder context:', error);
    throw error;
  }
}

/**
 * Formats file context for LLM consumption
 */
export function formatFileContextForLLM(folderContext: FolderContext): string {
  if (folderContext.files.length === 0) {
    return '';
  }
  
  let context = `\n=== FILE CONTEXT ===\n`;
  context += `Folder: ${folderContext.path}\n`;
  context += `Total files: ${folderContext.fileCount}\n`;
  context += `Total size: ${(folderContext.totalSize / 1024).toFixed(2)} KB\n\n`;
  
  for (const file of folderContext.files) {
    context += `--- ${file.path} (${file.type}, ${(file.size / 1024).toFixed(2)} KB) ---\n`;
    context += `${file.content}\n\n`;
  }
  
  context += `=== END FILE CONTEXT ===\n`;
  return context;
}

/**
 * Gets a summary of the folder structure
 */
export function getFolderSummary(folderContext: FolderContext): string {
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