const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    webPreferences: {
      // ★★★ ここが今回の修正点です ★★★
      // プロジェクトルートにあるpreload.jsを直接参照するようにパスを修正
      preload: path.join(__dirname, 'preload.js'),
      // ★★★ ここまで ★★★
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  
  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3001'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );
}

// (これ以降のipcMain.handleやapp.onなどの部分は変更ありません)
ipcMain.handle('get-image-files', async () => {
  const basePath = isDev ? __dirname : app.getAppPath();
  const imagesPath = path.join(basePath, 'public/images');

  console.log('Attempting to read images from:', imagesPath);

  try {
    const files = await fs.promises.readdir(imagesPath);
    return files.filter(file => /\.(png|jpe?g|gif)$/i.test(file));
  } catch (err) {
    console.error('Failed to read images directory:', err);
    return [];
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});