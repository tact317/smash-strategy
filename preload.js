// public/preload.js (全文)

const { contextBridge, ipcRenderer } = require('electron');

// 安全に `ipcRenderer` の一部の機能を
// Reactアプリ側（window.electronAPI）で使えるように公開します
contextBridge.exposeInMainWorld('electronAPI', {
  getImageFileNames: () => ipcRenderer.invoke('get-image-files')
});