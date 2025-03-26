// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const StorageManager = require('./utils/storageManager');
const { generatePassword } = require('./utils/passwordGenerator');
const fs = require('fs');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  const storageManager = new StorageManager();

  // Generate password handler
  ipcMain.handle('generate-password', (event, length) => {
    return generatePassword(length);
  });

  // Save password handler
  ipcMain.handle('save-password', (event, passwordEntry) => {
    const passwords = storageManager.readPasswords();
    passwords.push(passwordEntry);
    return storageManager.savePasswords(passwords);
  });

  // Get passwords handler
  ipcMain.handle('get-passwords', () => {
    return storageManager.readPasswords();
  });

  // Import passwords handler
  ipcMain.handle('import-passwords', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'JSON Files', extensions: ['json'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const importedPasswords = storageManager.importPasswords(result.filePaths[0]);
      return importedPasswords;
    }
    return [];
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
