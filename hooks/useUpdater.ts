import { useState, useEffect } from 'react';

export interface UpdateInfo {
  version: string;
  isChecking: boolean;
  hasUpdate: boolean;
  error: string | null;
  hasChecked: boolean;
  latestVersion?: string;
  note?: string;
}

export const useUpdater = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    version: '1.0.0',
    isChecking: false,
    hasUpdate: false,
    error: null,
    hasChecked: false
  });

  useEffect(() => {
    // Get current version on load
    const getCurrentVersion = async () => {
      try {
        if (window.electronAPI?.getVersion) {
          const version = await window.electronAPI.getVersion();
          setUpdateInfo(prev => ({ ...prev, version }));
        }
      } catch (error) {
        console.error('Error getting version:', error);
      }
    };

    getCurrentVersion();
  }, []);

  const checkForUpdates = async () => {
    try {
      setUpdateInfo(prev => ({ ...prev, isChecking: true, error: null }));
      
      if (window.electronAPI?.checkForUpdates) {
        const result = await window.electronAPI.checkForUpdates();
        console.log('Update check result:', result);
        
        // Handle different response types from the main process
        if (result.hasUpdate !== undefined) {
          // New detailed response format
          setUpdateInfo(prev => ({ 
            ...prev, 
            isChecking: false,
            hasUpdate: result.hasUpdate,
            hasChecked: true,
            latestVersion: result.latestVersion,
            note: result.note,
            error: result.hasUpdate ? null : (result.note || null)
          }));
        } else if (result.message) {
          // Legacy message-based responses
          if (result.message.includes('development mode')) {
            setUpdateInfo(prev => ({ 
              ...prev, 
              isChecking: false,
              hasUpdate: false,
              hasChecked: true,
              error: 'Updates only available in packaged app'
            }));
          } else if (result.message.includes('Checking for updates')) {
            // Auto-updater is working, wait for real response
            setUpdateInfo(prev => ({ 
              ...prev, 
              isChecking: false,
              hasUpdate: false,
              hasChecked: true,
              error: null
            }));
          } else {
            setUpdateInfo(prev => ({ 
              ...prev, 
              isChecking: false,
              hasUpdate: false,
              hasChecked: true,
              error: result.message
            }));
          }
        } else {
          // Default case - no updates available
          setUpdateInfo(prev => ({ 
            ...prev, 
            isChecking: false,
            hasUpdate: false,
            hasChecked: true,
            error: null
          }));
        }
      } else {
        // Running in web browser, not Electron
        setUpdateInfo(prev => ({ 
          ...prev, 
          isChecking: false,
          hasChecked: true,
          error: 'Updates only available in desktop app'
        }));
      }
    } catch (error) {
      setUpdateInfo(prev => ({ 
        ...prev, 
        isChecking: false,
        hasChecked: true,
        error: error instanceof Error ? error.message : 'Failed to check for updates'
      }));
    }
  };

  const installUpdate = async () => {
    try {
      if (window.electronAPI?.quitAndInstall) {
        const result = await window.electronAPI.quitAndInstall();
        
        // Handle response from main process
        if (result?.message && result.message.includes('development mode')) {
          setUpdateInfo(prev => ({ 
            ...prev, 
            error: 'Install only available in packaged app'
          }));
        } else if (result?.error) {
          setUpdateInfo(prev => ({ 
            ...prev, 
            error: result.error
          }));
        }
      } else {
        setUpdateInfo(prev => ({ 
          ...prev, 
          error: 'Install only available in desktop app'
        }));
      }
    } catch (error) {
      setUpdateInfo(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to install update'
      }));
    }
  };

  return {
    updateInfo,
    checkForUpdates,
    installUpdate
  };
};
