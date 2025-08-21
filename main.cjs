// Electron main process
const { app, BrowserWindow, protocol, ipcMain, autoUpdater, dialog } = require('electron');
const path = require('path');

let db;
let mainWindow;

// Auto-updater configuration
function setupAutoUpdater() {
  // Only check for updates in production
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    console.log('Auto-updater disabled in development mode');
    return;
  }

  try {
    // Set the update server URL for GitHub releases
    autoUpdater.setFeedURL({
      url: 'https://github.com/coderlifebh/curtain-quotation-pro/releases/latest',
      serverType: 'json'
    });

    // Check for updates when app starts
    autoUpdater.checkForUpdates();

    // Auto-updater event handlers
    autoUpdater.on('checking-for-update', () => {
      console.log('Checking for update...');
    });

    autoUpdater.on('update-available', (info) => {
      console.log('Update available:', info);
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: 'A new version is available. It will be downloaded in the background.',
        buttons: ['OK']
      });
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('Update not available:', info);
    });

    autoUpdater.on('error', (err) => {
      console.error('Error in auto-updater:', err);
    });

    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      console.log(log_message);
    });

    autoUpdater.on('update-downloaded', (info) => {
      console.log('Update downloaded:', info);
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. The application will restart to apply the update.',
        buttons: ['Restart Now', 'Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    });
  } catch (error) {
    console.error('Auto-updater setup failed:', error.message);
  }
}

function initializeDatabase() {
  try {
    // Try to use SQLite first
    const DatabaseService = require('./database.cjs');
    db = new DatabaseService();
    console.log('SQLite database initialized successfully');
  } catch (error) {
    console.warn('SQLite initialization failed, falling back to simple file database:', error.message);
    try {
      // Fallback to simple file database
      const SimpleFileDatabase = require('./simpleDatabase.cjs');
      db = new SimpleFileDatabase();
      console.log('Simple file database initialized successfully');
    } catch (fallbackError) {
      console.error('Database initialization failed completely:', fallbackError);
      // Continue without database - app will use localStorage
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: false, // Allow loading local files
      spellcheck: false, // Disable spellcheck to avoid input conflicts
      preload: path.join(__dirname, 'preload.cjs'), // We'll create this file
    },
    show: false, // Don't show until ready
  });
  
  // Load the dist/index.html file
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  console.log('Loading file from:', indexPath);
  
  // Show window when ready to prevent rendering issues
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
  
  mainWindow.loadFile(indexPath);
  
  // Open DevTools for debugging (remove in production)
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  // Initialize database with error handling
  initializeDatabase();
  
  createWindow();
  
  // Setup auto-updater (only in production)
  setupAutoUpdater();
  
  // Handle focus issues that can cause input problems
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (db && typeof db.close === 'function') {
    try {
      db.close();
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Handle certificate errors for HTTPS resources
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  event.preventDefault();
  callback(true);
});

// Database IPC handlers with error handling
const handleDatabaseOperation = async (operation) => {
  if (!db) {
    throw new Error('Database not available');
  }
  return await operation();
};

ipcMain.handle('db:get-clients', async () => {
  try {
    return await handleDatabaseOperation(() => db.getAllClients());
  } catch (error) {
    console.error('Error getting clients:', error);
    return [];
  }
});

ipcMain.handle('db:insert-client', async (event, client) => {
  try {
    return await handleDatabaseOperation(() => db.insertClient(client));
  } catch (error) {
    console.error('Error inserting client:', error);
    throw error;
  }
});

ipcMain.handle('db:update-client', async (event, client) => {
  try {
    return await handleDatabaseOperation(() => db.updateClient(client));
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
});

ipcMain.handle('db:delete-client', async (event, id) => {
  try {
    return await handleDatabaseOperation(() => db.deleteClient(id));
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
});

ipcMain.handle('db:get-products', async () => {
  try {
    return await handleDatabaseOperation(() => db.getAllProducts());
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
});

ipcMain.handle('db:insert-product', async (event, product) => {
  try {
    return await handleDatabaseOperation(() => db.insertProduct(product));
  } catch (error) {
    console.error('Error inserting product:', error);
    throw error;
  }
});

ipcMain.handle('db:update-product', async (event, product) => {
  try {
    return await handleDatabaseOperation(() => db.updateProduct(product));
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
});

ipcMain.handle('db:delete-product', async (event, id) => {
  try {
    return await handleDatabaseOperation(() => db.deleteProduct(id));
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
});

ipcMain.handle('db:get-quotations', async () => {
  try {
    return await handleDatabaseOperation(() => db.getAllQuotations());
  } catch (error) {
    console.error('Error getting quotations:', error);
    return [];
  }
});

ipcMain.handle('db:get-quotation', async (event, id) => {
  try {
    return await handleDatabaseOperation(() => db.getQuotationById(id));
  } catch (error) {
    console.error('Error getting quotation:', error);
    return null;
  }
});

ipcMain.handle('db:insert-quotation', async (event, quotation) => {
  try {
    return await handleDatabaseOperation(() => db.insertQuotation(quotation));
  } catch (error) {
    console.error('Error inserting quotation:', error);
    throw error;
  }
});

ipcMain.handle('db:update-quotation', async (event, quotation) => {
  try {
    return await handleDatabaseOperation(() => db.updateQuotation(quotation));
  } catch (error) {
    console.error('Error updating quotation:', error);
    throw error;
  }
});

ipcMain.handle('db:delete-quotation', async (event, id) => {
  try {
    return await handleDatabaseOperation(() => db.deleteQuotation(id));
  } catch (error) {
    console.error('Error deleting quotation:', error);
    throw error;
  }
});

ipcMain.handle('db:get-settings', async () => {
  try {
    return await handleDatabaseOperation(() => db.getSettings());
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
});

ipcMain.handle('db:update-settings', async (event, settings) => {
  try {
    return await handleDatabaseOperation(() => db.updateSettings(settings));
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
});

ipcMain.handle('db:export-data', async () => {
  try {
    return await handleDatabaseOperation(() => db.exportData());
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
});

ipcMain.handle('db:import-data', async (event, data) => {
  try {
    return await handleDatabaseOperation(() => db.importData(data));
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
});

// Auto-updater IPC handlers
ipcMain.handle('updater:check-for-updates', async () => {
  try {
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      return { message: 'Updates not available in development mode' };
    }
    autoUpdater.checkForUpdates();
    return { message: 'Checking for updates...' };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return { message: 'Error checking for updates', error: error.message };
  }
});

ipcMain.handle('updater:get-version', async () => {
  return app.getVersion();
});

ipcMain.handle('updater:quit-and-install', async () => {
  try {
    if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
      return { message: 'Install not available in development mode' };
    }
    autoUpdater.quitAndInstall();
    return { message: 'Installing update...' };
  } catch (error) {
    console.error('Error quitting and installing:', error);
    return { message: 'Error installing update', error: error.message };
  }
});
