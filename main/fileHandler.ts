import { ipcMain } from 'electron';
import { readFile, readdir, stat } from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Reads a single file and returns its context
 */
async function readFileContext(filePath: string): Promise<FileContext> {
  // Convert relative paths to absolute paths
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  
  console.log(`[DEBUG] Original filePath: ${filePath}`);
  console.log(`[DEBUG] Process cwd: ${process.cwd()}`);
  console.log(`[DEBUG] Resolved absolutePath: ${absolutePath}`);
  
  try {
    const stats = await stat(absolutePath);
    const ext = path.extname(absolutePath).toLowerCase();
    
    // Handle different file types
    if (ext === '.pdf') {
      // For PDFs, use Python script with PyPDF2 for text extraction
      try {
        // Try multiple possible script locations
        const possibleScriptPaths = [
          path.join(__dirname, '..', 'scripts', 'pdf_extractor.py'),
          path.join(process.cwd(), 'scripts', 'pdf_extractor.py'),
          path.join(process.cwd(), 'echo-frame', 'scripts', 'pdf_extractor.py')
        ];
        
        let scriptPath = null;
        for (const possiblePath of possibleScriptPaths) {
          try {
            await stat(possiblePath);
            scriptPath = possiblePath;
            break;
          } catch (e) {
            // Continue to next path
          }
        }
        
        if (!scriptPath) {
          throw new Error(`PDF extraction script not found. Tried: ${possibleScriptPaths.join(', ')}`);
        }
        

        
        return new Promise<FileContext>((resolve, reject) => {
          const pythonProcess = spawn('python3', [scriptPath, absolutePath]);
          
          let output = '';
          let errorOutput = '';
          
          pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
          });
          
          pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
          });
          
          pythonProcess.on('close', async (code) => {
            console.log(`Python process exited with code: ${code}`);
            console.log(`Python output: ${output}`);
            console.log(`Python errors: ${errorOutput}`);
            
            if (code === 0 && output.trim()) {
              try {
                const result = JSON.parse(output.trim());
                
                if (result.success) {
                  resolve({
                    path: absolutePath,
                    content: `[PDF File: ${path.basename(absolutePath)}]\n\n${result.text}\n\n[PDF Info: ${result.num_pages} pages]`,
                    type: '.pdf',
                    size: stats.size,
                    lastModified: stats.mtime
                  });
                } else {
                  throw new Error(result.error);
                }
              } catch (parseError) {
                reject(new Error(`Failed to parse Python output: ${parseError}\nRaw output: ${output}`));
              }
            } else {
              reject(new Error(`Python script failed with exit code ${code}: ${errorOutput || 'Unknown error'}\nOutput: ${output}`));
            }
          });
        });
      } catch (pdfError) {
        console.warn(`Failed to parse PDF ${absolutePath}:`, pdfError);
        return {
          path: absolutePath,
          content: `[PDF File: ${path.basename(absolutePath)}]\n\nFailed to parse PDF content: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`,
          type: '.pdf',
          size: stats.size,
          lastModified: stats.mtime
        };
      }
    } else {
      // For text files, read the content
      const content = await readFile(absolutePath, 'utf-8');
      return {
        path: absolutePath,
        content,
        type: ext,
        size: stats.size,
        lastModified: stats.mtime
      };
    }
  } catch (error) {
    throw new Error(`Failed to read file ${absolutePath}: ${error}`);
  }
}

/**
 * Reads all files in a directory recursively
 */
async function readFolderContext(folderPath: string, maxFiles: number = 50): Promise<FolderContext> {
  const files: FileContext[] = [];
  let totalSize = 0;
  
  async function scanDirectory(dirPath: string): Promise<void> {
    try {
      const items = await readdir(dirPath);
      
      for (const item of items) {
        if (files.length >= maxFiles) break;
        
        const fullPath = path.join(dirPath, item);
        const stats = await stat(fullPath);
        
        if (stats.isDirectory()) {
          // Skip node_modules, .git, and other common directories
          if (!['node_modules', '.git', '.DS_Store', 'dist', 'build'].includes(item)) {
            await scanDirectory(fullPath);
          }
        } else if (stats.isFile()) {
          // Include text-based files and PDFs
          const ext = path.extname(item).toLowerCase();
          const supportedExtensions = ['.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.json', '.py', '.java', '.cpp', '.c', '.h', '.css', '.html', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.log', '.pdf'];
          
          if (supportedExtensions.includes(ext) && stats.size < 10 * 1024 * 1024) { // Max 10MB per file
            try {
              const fileContext = await readFileContext(fullPath);
              files.push(fileContext);
              totalSize += stats.size;
            } catch (error) {
              console.warn(`Could not read file ${fullPath}: ${error}`);
            }
          }
        }
      }
    } catch (error) {
      console.warn(`Could not scan directory ${dirPath}: ${error}`);
    }
  }
  
  await scanDirectory(folderPath);
  
  return {
    path: folderPath,
    files,
    totalSize,
    fileCount: files.length
  };
}

// Set up IPC handlers
export function setupFileHandlers() {
  // Handle folder reading
  ipcMain.handle('read-folder-context', async (event, folderPath: string, maxFiles: number = 50) => {
    try {
      const context = await readFolderContext(folderPath, maxFiles);
      return { success: true, data: context };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });

  // Handle single file reading
  ipcMain.handle('read-file-context', async (event, filePath: string) => {
    console.log('[MAIN] IPC read-file-context called with:', filePath);
    try {
      const fileContext = await readFileContext(filePath);
      console.log('[MAIN] File context created successfully, content length:', fileContext.content.length);
      const context: FolderContext = {
        path: path.dirname(filePath),
        files: [fileContext],
        totalSize: fileContext.size,
        fileCount: 1
      };
      console.log('[MAIN] Returning success response');
      return { success: true, data: context };
    } catch (error) {
      console.error('[MAIN] Error in read-file-context handler:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  });
} 