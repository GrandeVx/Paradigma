import { useEffect, useState, useCallback } from 'react';
import * as Updates from 'expo-updates';
import { Platform } from 'react-native';

export interface UpdateInfo {
  isAvailable: boolean;
  isDownloading: boolean;
  isRestarting: boolean;
  isChecking: boolean;
  manifest?: object;
  error?: Error;
}

export interface UseExpoUpdatesReturn {
  updateInfo: UpdateInfo;
  checkForUpdates: () => Promise<{ isAvailable: boolean; error?: Error }>;
  downloadAndRestart: () => Promise<void>;
  dismissUpdate: () => void;
}

export function useExpoUpdates(): UseExpoUpdatesReturn {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({
    isAvailable: false,
    isDownloading: false,
    isRestarting: false,
    isChecking: false,
  });

  const checkForUpdates = useCallback(async (): Promise<{ isAvailable: boolean; error?: Error }> => {
    try {
      // Solo su dispositivi nativi, non su web o simulatori
      if (!Updates.isEnabled || Platform.OS === 'web' || __DEV__) {
        console.log('[useExpoUpdates] Updates not enabled for this environment');
        return { isAvailable: false };
      }

      setUpdateInfo(prev => ({ ...prev, isChecking: true, error: undefined }));
      console.log('[useExpoUpdates] Checking for updates...');
      
      const { isAvailable, manifest } = await Updates.checkForUpdateAsync();

      if (isAvailable) {
        console.log('[useExpoUpdates] Update available:', manifest);
        setUpdateInfo(prev => ({
          ...prev,
          isAvailable: true,
          manifest,
          error: undefined,
          isChecking: false,
        }));
        return { isAvailable: true };
      } else {
        console.log('[useExpoUpdates] No updates available');
        setUpdateInfo(prev => ({
          ...prev,
          isAvailable: false,
          error: undefined,
          isChecking: false,
        }));
        return { isAvailable: false };
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      const errorObj = error as Error;
      setUpdateInfo(prev => ({
        ...prev,
        error: errorObj,
        isAvailable: false,
        isChecking: false,
      }));
      return { isAvailable: false, error: errorObj };
    }
  }, []);

  const downloadAndRestart = useCallback(async () => {
    try {
      if (!Updates.isEnabled) {
        throw new Error('[useExpoUpdates] Updates not enabled');
      }

      setUpdateInfo(prev => ({ ...prev, isDownloading: true, error: undefined }));

      console.log('[useExpoUpdates] Downloading update...');
      const { isNew } = await Updates.fetchUpdateAsync();

      if (isNew) {
        console.log('[useExpoUpdates] Update downloaded, restarting...');
        setUpdateInfo(prev => ({ ...prev, isDownloading: false, isRestarting: true }));
        
        // Piccolo delay per permettere all'UI di aggiornarsi
        setTimeout(() => {
          Updates.reloadAsync();
        }, 1000);
      } else {
        console.log('[useExpoUpdates] No new update to download');
        setUpdateInfo(prev => ({
          ...prev,
          isDownloading: false,
          isAvailable: false,
        }));
      }
    } catch (error) {
      console.error('[useExpoUpdates] Error downloading update:', error);
      setUpdateInfo(prev => ({
        ...prev,
        isDownloading: false,
        isRestarting: false,
        error: error as Error,
      }));
    }
  }, []);

  const dismissUpdate = useCallback(() => {
    setUpdateInfo(prev => ({
      ...prev,
      isAvailable: false,
      error: undefined,
    }));
  }, []);

  // Controllo automatico all'avvio con retry logic
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;
    const baseDelay = 5000; // 5 secondi iniziali
    
    const performUpdateCheck = async () => {
      const result = await checkForUpdates();
      
      // Se c'è un errore e abbiamo ancora tentativi disponibili, riprova
      if (result.error && retryCount < maxRetries) {
        retryCount++;
        const retryDelay = baseDelay * retryCount; // Delay progressivo
        console.log(`[useExpoUpdates] Update check failed, retrying in ${retryDelay}ms (attempt ${retryCount}/${maxRetries})`);
        
        setTimeout(performUpdateCheck, retryDelay);
      }
    };

    // Primo controllo dopo 5 secondi (aumentato da 3)
    const timer = setTimeout(performUpdateCheck, baseDelay);

    return () => clearTimeout(timer);
  }, [checkForUpdates]);



  return {
    updateInfo,
    checkForUpdates,
    downloadAndRestart,
    dismissUpdate,
  };
} 