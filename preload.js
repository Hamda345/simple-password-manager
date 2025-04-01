const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Existing functions
  generatePassword: (length) => ipcRenderer.invoke('generate-password', length),
  savePassword: (passwordEntry) => ipcRenderer.invoke('save-password', passwordEntry),
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  importPasswords: () => ipcRenderer.invoke('import-passwords'),

  // New steganography functions
  checkSteghideInstalled: () => ipcRenderer.invoke('check-steghide'),
  getSteghideInstructions: () => ipcRenderer.invoke('get-steghide-instructions'),
  selectCoverImage: () => ipcRenderer.invoke('select-cover-image'),
  selectStegoOutput: (defaultName) => ipcRenderer.invoke('select-stego-output', defaultName),
  hidePasswords: (imagePath, outputPath, password) =>
    ipcRenderer.invoke('hide-passwords', imagePath, outputPath, password),
  selectStegoImage: () => ipcRenderer.invoke('select-stego-image'),
  extractPasswords: (imagePath, password) =>
    ipcRenderer.invoke('extract-passwords', imagePath, password)
});
