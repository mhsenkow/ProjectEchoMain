const { ipcMain } = require('electron');
const { setupFileHandlers } = require('./dist/main/fileHandler.js');

// Simulate the IPC handler setup
setupFileHandlers();

// Test the PDF reading
async function testPDF() {
  console.log('Testing PDF reading...');
  
  try {
    // Simulate an IPC call
    const result = await ipcMain.handle('read-file-context', null, 'main/my_atlas_who_carries_our_heaven.pdf');
    console.log('Result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}

testPDF(); 