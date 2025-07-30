import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useExpoUpdates } from '@/hooks/use-expo-updates';
import { useTranslation } from 'react-i18next';

export type UpdateStatus = 'idle' | 'checking' | 'available' | 'upToDate' | 'error';

interface UpdateStatusResult {
  status: UpdateStatus;
  label: string;
  iconColor: string;
  onPress: () => void;
}

export function useUpdateStatus(): UpdateStatusResult {
  const { t } = useTranslation();
  const {
    updateInfo,
    checkForUpdates,
    downloadAndRestart
  } = useExpoUpdates();

  // Determine current status
  const getStatus = (): UpdateStatus => {
    if (updateInfo.isChecking) return 'checking';
    if (updateInfo.error) return 'error';
    if (updateInfo.isAvailable) return 'available';
    if (updateInfo.lastChecked && !updateInfo.isAvailable) return 'upToDate';
    return 'idle';
  };

  const status = getStatus();

  // Get label based on status
  const getLabel = (): string => {
    switch (status) {
      case 'checking':
        return t('update.checking', 'Controllo in corso...');
      case 'available':
        return t('update.available.title', 'Aggiornamento disponibile');
      case 'upToDate':
        return t('update.upToDate', 'App aggiornata');
      case 'error':
        return t('update.error.title', 'Errore controllo');
      default:
        return t('update.manual.check', 'Controlla aggiornamenti');
    }
  };

  // Get icon color based on status
  const getIconColor = (): string => {
    switch (status) {
      case 'available':
        return '#007AFF'; // Blue
      case 'error':
        return '#DE4841'; // Red
      default:
        return '#6B7280'; // Gray
    }
  };

  // Handle press action
  const handlePress = useCallback(async () => {
    if (updateInfo.isChecking || updateInfo.isDownloading || updateInfo.isRestarting) {
      return; // Do nothing if operation in progress
    }

    switch (status) {
      case 'available':
        // Show update available dialog
        Alert.alert(
          t('update.available.title', 'Aggiornamento disponibile'),
          t('update.available.message', 'È disponibile una nuova versione dell\'app. Vuoi aggiornare ora?'),
          [
            {
              text: t('update.cancel', 'Annulla'),
              style: 'cancel'
            },
            {
              text: t('update.install', 'Aggiorna ora'),
              onPress: async () => {
                try {
                  await downloadAndRestart();
                } catch (error) {
                  Alert.alert(
                    t('update.error.title', 'Errore'),
                    t('update.downloadError.message', 'Impossibile scaricare l\'aggiornamento. Riprova più tardi.'),
                    [{ text: t('update.close', 'OK') }]
                  );
                }
              }
            }
          ]
        );
        break;

      case 'upToDate':
        // Show already up to date message
        Alert.alert(
          t('update.noUpdates.title', 'App aggiornata'),
          t('update.noUpdates.message', 'Stai già utilizzando la versione più recente dell\'app.'),
          [{ text: t('update.close', 'OK') }]
        );
        break;

      case 'error':
        // Show error and allow retry
        Alert.alert(
          t('update.error.title', 'Errore'),
          t('update.checkError.message', 'Impossibile controllare gli aggiornamenti. Verifica la connessione internet e riprova.'),
          [
            {
              text: t('update.cancel', 'Annulla'),
              style: 'cancel'
            },
            {
              text: t('update.retry', 'Riprova'),
              onPress: handleCheckForUpdates
            }
          ]
        );
        break;

      default:
        // Check for updates
        await handleCheckForUpdates();
        break;
    }
  }, [status, updateInfo, downloadAndRestart, t]);

  const handleCheckForUpdates = useCallback(async () => {
    try {
      const result = await checkForUpdates();

      // Show success message only if no update is available and no error
      if (!result.isAvailable && !result.error) {
        Alert.alert(
          t('update.noUpdates.title', 'App aggiornata'),
          t('update.noUpdates.message', 'Stai già utilizzando la versione più recente dell\'app.'),
          [{ text: t('update.close', 'OK') }]
        );
      } else if (result.error) {
        Alert.alert(
          t('update.error.title', 'Errore'),
          t('update.checkError.message', 'Impossibile controllare gli aggiornamenti. Verifica la connessione internet e riprova.'),
          [{ text: t('update.close', 'OK') }]
        );
      }
      // If update is available, the UI will automatically show the new status
    } catch (error) {
      Alert.alert(
        t('update.error.title', 'Errore'),
        t('update.checkError.message', 'Impossibile controllare gli aggiornamenti. Verifica la connessione internet e riprova.'),
        [{ text: t('update.close', 'OK') }]
      );
    }
  }, [checkForUpdates, t]);

  return {
    status,
    label: getLabel(),
    iconColor: getIconColor(),
    onPress: handlePress
  };
}