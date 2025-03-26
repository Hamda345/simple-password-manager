// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generatePassword: (length) => ipcRenderer.invoke('generate-password', length),
  savePassword: (passwordEntry) => ipcRenderer.invoke('save-password', passwordEntry),
  getPasswords: () => ipcRenderer.invoke('get-passwords'),
  importPasswords: () => ipcRenderer.invoke('import-passwords')
});
