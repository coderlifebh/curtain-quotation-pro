import { useState, useEffect } from 'react';

// Type declarations for the Electron API
declare global {
  interface Window {
    electronAPI: {
      // Client operations
      getClients: () => Promise<any[]>;
      insertClient: (client: any) => Promise<any>;
      updateClient: (client: any) => Promise<any>;
      deleteClient: (id: string) => Promise<any>;
      
      // Product operations
      getProducts: () => Promise<any[]>;
      insertProduct: (product: any) => Promise<any>;
      updateProduct: (product: any) => Promise<any>;
      deleteProduct: (id: string) => Promise<any>;
      
      // Quotation operations
      getQuotations: () => Promise<any[]>;
      getQuotation: (id: string) => Promise<any>;
      insertQuotation: (quotation: any) => Promise<any>;
      updateQuotation: (quotation: any) => Promise<any>;
      deleteQuotation: (id: string) => Promise<any>;
      
      // Settings operations
      getSettings: () => Promise<any>;
      updateSettings: (settings: any) => Promise<any>;
      
      // Import/Export operations
      exportData: () => Promise<any>;
      importData: (data: any) => Promise<any>;
      
      // Auto-updater operations
      checkForUpdates: () => Promise<{ message: string }>;
      getVersion: () => Promise<string>;
      quitAndInstall: () => Promise<void>;
    };
  }
}

// Check if we're running in Electron
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI;
};

// Custom hook for database operations
export const useDatabase = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setIsConnected(isElectron());
  }, []);

  // Fallback to localStorage if not in Electron
  const getStorageKey = (key: string) => `curtain_app_${key}`;

  const api = {
    // Client operations
    getClients: async () => {
      if (isConnected) {
        return await window.electronAPI.getClients();
      }
      const stored = localStorage.getItem(getStorageKey('clients'));
      return stored ? JSON.parse(stored) : [];
    },

    insertClient: async (client: any) => {
      if (isConnected) {
        return await window.electronAPI.insertClient(client);
      }
      const clients = await api.getClients();
      clients.push(client);
      localStorage.setItem(getStorageKey('clients'), JSON.stringify(clients));
      return { success: true };
    },

    updateClient: async (client: any) => {
      if (isConnected) {
        return await window.electronAPI.updateClient(client);
      }
      const clients = await api.getClients();
      const index = clients.findIndex((c: any) => c.id === client.id);
      if (index !== -1) {
        clients[index] = client;
        localStorage.setItem(getStorageKey('clients'), JSON.stringify(clients));
      }
      return { success: true };
    },

    deleteClient: async (id: string) => {
      if (isConnected) {
        return await window.electronAPI.deleteClient(id);
      }
      const clients = await api.getClients();
      const filtered = clients.filter((c: any) => c.id !== id);
      localStorage.setItem(getStorageKey('clients'), JSON.stringify(filtered));
      return { success: true };
    },

    // Product operations
    getProducts: async () => {
      if (isConnected) {
        return await window.electronAPI.getProducts();
      }
      const stored = localStorage.getItem(getStorageKey('products'));
      return stored ? JSON.parse(stored) : [];
    },

    insertProduct: async (product: any) => {
      if (isConnected) {
        return await window.electronAPI.insertProduct(product);
      }
      const products = await api.getProducts();
      products.push(product);
      localStorage.setItem(getStorageKey('products'), JSON.stringify(products));
      return { success: true };
    },

    updateProduct: async (product: any) => {
      if (isConnected) {
        return await window.electronAPI.updateProduct(product);
      }
      const products = await api.getProducts();
      const index = products.findIndex((p: any) => p.id === product.id);
      if (index !== -1) {
        products[index] = product;
        localStorage.setItem(getStorageKey('products'), JSON.stringify(products));
      }
      return { success: true };
    },

    deleteProduct: async (id: string) => {
      if (isConnected) {
        return await window.electronAPI.deleteProduct(id);
      }
      const products = await api.getProducts();
      const filtered = products.filter((p: any) => p.id !== id);
      localStorage.setItem(getStorageKey('products'), JSON.stringify(filtered));
      return { success: true };
    },

    // Quotation operations
    getQuotations: async () => {
      if (isConnected) {
        return await window.electronAPI.getQuotations();
      }
      const stored = localStorage.getItem(getStorageKey('quotations'));
      return stored ? JSON.parse(stored) : [];
    },

    getQuotation: async (id: string) => {
      if (isConnected) {
        return await window.electronAPI.getQuotation(id);
      }
      const quotations = await api.getQuotations();
      return quotations.find((q: any) => q.id === id);
    },

    insertQuotation: async (quotation: any) => {
      if (isConnected) {
        return await window.electronAPI.insertQuotation(quotation);
      }
      const quotations = await api.getQuotations();
      quotations.push(quotation);
      localStorage.setItem(getStorageKey('quotations'), JSON.stringify(quotations));
      return { success: true };
    },

    updateQuotation: async (quotation: any) => {
      if (isConnected) {
        return await window.electronAPI.updateQuotation(quotation);
      }
      const quotations = await api.getQuotations();
      const index = quotations.findIndex((q: any) => q.id === quotation.id);
      if (index !== -1) {
        quotations[index] = quotation;
        localStorage.setItem(getStorageKey('quotations'), JSON.stringify(quotations));
      }
      return { success: true };
    },

    deleteQuotation: async (id: string) => {
      if (isConnected) {
        return await window.electronAPI.deleteQuotation(id);
      }
      const quotations = await api.getQuotations();
      const filtered = quotations.filter((q: any) => q.id !== id);
      localStorage.setItem(getStorageKey('quotations'), JSON.stringify(filtered));
      return { success: true };
    },

    // Settings operations
    getSettings: async () => {
      if (isConnected) {
        return await window.electronAPI.getSettings();
      }
      const stored = localStorage.getItem(getStorageKey('settings'));
      return stored ? JSON.parse(stored) : null;
    },

    updateSettings: async (settings: any) => {
      if (isConnected) {
        return await window.electronAPI.updateSettings(settings);
      }
      localStorage.setItem(getStorageKey('settings'), JSON.stringify(settings));
      return { success: true };
    },

    // Import/Export operations
    exportData: async () => {
      if (isConnected) {
        return await window.electronAPI.exportData();
      }
      return {
        clients: await api.getClients(),
        products: await api.getProducts(),
        quotations: await api.getQuotations(),
        settings: await api.getSettings()
      };
    },

    importData: async (data: any) => {
      if (isConnected) {
        return await window.electronAPI.importData(data);
      }
      if (data.clients) localStorage.setItem(getStorageKey('clients'), JSON.stringify(data.clients));
      if (data.products) localStorage.setItem(getStorageKey('products'), JSON.stringify(data.products));
      if (data.quotations) localStorage.setItem(getStorageKey('quotations'), JSON.stringify(data.quotations));
      if (data.settings) localStorage.setItem(getStorageKey('settings'), JSON.stringify(data.settings));
      return { success: true };
    }
  };

  return { api, isConnected };
};
