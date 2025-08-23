import { useState, useEffect } from 'react';

export interface UpdateInfo {
  version: string;
  isChecking: boolean;
  hasUpdate: boolean;
  error: string | null;
}

export const useUpdater = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    version: '1.0.0',
    isChecking: false,
    hasUpdate: false,
    error: null
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
        
        // In a real implementation, you would handle the result from the auto-updater
        // For now, we'll just show that we checked
        setUpdateInfo(prev => ({ 
          ...prev, 
          isChecking: false,
          hasUpdate: false // This would be determined by the actual update check
        }));
      } else {
        // Running in web browser, not Electron
        setUpdateInfo(prev => ({ 
          ...prev, 
          isChecking: false,
          error: 'Updates not available in web version'
        }));
      }
    } catch (error) {
      setUpdateInfo(prev => ({ 
        ...prev, 
        isChecking: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const installUpdate = async () => {
    try {
      if (window.electronAPI?.quitAndInstall) {
        await window.electronAPI.quitAndInstall();
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
