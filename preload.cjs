const { contextBridge, ipcRenderer } = require('electron');

// Expose database API to renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Client operations
  getClients: () => ipcRenderer.invoke('db:get-clients'),
  insertClient: (client) => ipcRenderer.invoke('db:insert-client', client),
  updateClient: (client) => ipcRenderer.invoke('db:update-client', client),
  deleteClient: (id) => ipcRenderer.invoke('db:delete-client', id),
  
  // Product operations
  getProducts: () => ipcRenderer.invoke('db:get-products'),
  insertProduct: (product) => ipcRenderer.invoke('db:insert-product', product),
  updateProduct: (product) => ipcRenderer.invoke('db:update-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('db:delete-product', id),
  
  // Quotation operations
  getQuotations: () => ipcRenderer.invoke('db:get-quotations'),
  getQuotation: (id) => ipcRenderer.invoke('db:get-quotation', id),
  insertQuotation: (quotation) => ipcRenderer.invoke('db:insert-quotation', quotation),
  updateQuotation: (quotation) => ipcRenderer.invoke('db:update-quotation', quotation),
  deleteQuotation: (id) => ipcRenderer.invoke('db:delete-quotation', id),
  
  // Settings operations
  getSettings: () => ipcRenderer.invoke('db:get-settings'),
  updateSettings: (settings) => ipcRenderer.invoke('db:update-settings', settings),
  
  // Import/Export operations
  exportData: () => ipcRenderer.invoke('db:export-data'),
  importData: (data) => ipcRenderer.invoke('db:import-data', data),
  
  // Auto-updater operations
  checkForUpdates: () => ipcRenderer.invoke('updater:check-for-updates'),
  getVersion: () => ipcRenderer.invoke('updater:get-version'),
  quitAndInstall: () => ipcRenderer.invoke('updater:quit-and-install')
});
