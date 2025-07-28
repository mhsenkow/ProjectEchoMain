import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test the PDF extraction script
async function testPDFExtraction() {
  const scriptPath = path.join(__dirname, 'scripts', 'pdf_extractor.py');
  const testPDFPath = path.join(__dirname, 'main', 'my_atlas_who_carries_our_heaven.pdf');
  
  console.log('Testing PDF extraction...');
  console.log('Script path:', scriptPath);
  console.log('PDF path:', testPDFPath);
  
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [scriptPath, testPDFPath]);
    
    let output = '';
    let errorOutput = '';
    
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      console.log(`Python process exited with code: ${code}`);
      console.log(`Output: ${output}`);
      console.log(`Errors: ${errorOutput}`);
      
      if (code === 0) {
        try {
          const result = JSON.parse(output.trim());
          if (result.success) {
            console.log('✅ PDF extraction successful!');
            console.log(`Pages: ${result.num_pages}`);
            console.log(`Text length: ${result.text.length} characters`);
            resolve(result);
          } else {
            console.error('❌ PDF extraction failed:', result.error);
            reject(new Error(result.error));
          }
        } catch (parseError) {
          console.error('❌ Failed to parse Python output:', parseError);
          reject(parseError);
        }
      } else {
        console.error('❌ Python script failed with exit code:', code);
        reject(new Error(`Python script failed: ${errorOutput}`));
      }
    });
  });
}

// Test file system access
async function testFileSystem() {
  const fs = await import('fs/promises');
  const path = await import('path');
  
  console.log('\nTesting file system access...');
  
  try {
    const currentDir = process.cwd();
    console.log('Current directory:', currentDir);
    
    const files = await fs.default.readdir(currentDir);
    console.log('Files in current directory:', files.slice(0, 5));
    
    const scriptsDir = path.default.join(currentDir, 'scripts');
    const scriptsFiles = await fs.default.readdir(scriptsDir);
    console.log('Files in scripts directory:', scriptsFiles);
    
    console.log('✅ File system access working!');
  } catch (error) {
    console.error('❌ File system access failed:', error);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Running file reading tests...\n');
  
  try {
    await testFileSystem();
    await testPDFExtraction();
    console.log('\n✅ All tests passed!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
  }
}

runTests(); 