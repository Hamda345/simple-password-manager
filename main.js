// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const StorageManager = require('./utils/storageManager');
const { generatePassword } = require('./utils/passwordGenerator');
const SteganographyManager = require('./utils/steganographyManager');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(async () => {
  const storageManager = new StorageManager();
  const stegoManager = new SteganographyManager();

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

  // Check if steghide is installed
  ipcMain.handle('check-steghide', async () => {
    return await stegoManager.checkSteghideInstalled();
  });

  // Get steghide installation instructions
  ipcMain.handle('get-steghide-instructions', () => {
    return stegoManager.getInstallationInstructions();
  });

  // Select image for hiding passwords
  ipcMain.handle('select-cover-image', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  // Select output location for steganography image
  ipcMain.handle('select-stego-output', async (event, defaultName) => {
    const result = await dialog.showSaveDialog({
      title: 'Save Steganographic Image',
      defaultPath: defaultName || 'secure-image.jpg',
      filters: [
        { name: 'JPEG Images', extensions: ['jpg'] }
      ]
    });

    if (!result.canceled) {
      return result.filePath;
    }
    return null;
  });

  // Hide passwords in image
  ipcMain.handle('hide-passwords', async (event, imagePath, outputPath, password) => {
    try {
      const passwordsPath = storageManager.storagePath;
      await stegoManager.hidePasswordsInImage(passwordsPath, imagePath, outputPath, password);
      return { success: true, message: 'Passwords successfully hidden in image' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  });

  // Select image for extracting passwords
  ipcMain.handle('select-stego-image', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'bmp'] }
      ]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });

  // Extract passwords from image
  ipcMain.handle('extract-passwords', async (event, imagePath, password) => {
    try {
      const outputPath = storageManager.storagePath;
      await stegoManager.extractPasswordsFromImage(imagePath, outputPath, password);
      // Refresh passwords from the extracted file
      const passwords = storageManager.readPasswords();
      return { success: true, message: 'Passwords successfully extracted', passwords };
    } catch (error) {
      return { success: false, message: error.message };
    }
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
