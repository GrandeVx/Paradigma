import React from 'react';
import { View, Alert } from 'react-native';
import { Button } from './button';
import { Text } from './text';
import { useExpoUpdates } from '@/hooks/use-expo-updates';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useColorScheme } from '@/components/useColorScheme';

interface ManualUpdateCheckerProps {
  className?: string;
}

export function ManualUpdateChecker({ className }: ManualUpdateCheckerProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const {
    updateInfo,
    checkForUpdates,
    downloadAndRestart
  } = useExpoUpdates();

  const handleCheckForUpdates = async () => {
    try {
      const result = await checkForUpdates();

      // Ora usiamo il risultato diretto dalla funzione invece dello stato
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
      // Se c'è un aggiornamento disponibile, non mostriamo l'alert qui
      // perché l'UI si aggiorna automaticamente per mostrare il pulsante di aggiornamento
    } catch (error) {
      Alert.alert(
        t('update.error.title', 'Errore'),
        t('update.checkError.message', 'Impossibile controllare gli aggiornamenti. Verifica la connessione internet e riprova.'),
        [{ text: t('update.close', 'OK') }]
      );
    }
  };

  const handleUpdateNow = async () => {
    try {
      await downloadAndRestart();
    } catch (error) {
      Alert.alert(
        t('update.error.title', 'Errore'),
        t('update.downloadError.message', 'Impossibile scaricare l\'aggiornamento. Riprova più tardi.'),
        [{ text: t('update.close', 'OK') }]
      );
    }
  };

  const showUpdateAvailable = updateInfo.isAvailable && !updateInfo.isDownloading && !updateInfo.isRestarting;

  return (
    <View className={cn('space-y-4', className)}>
      {/* Info sezione */}
      <View>
        <Text className={cn(
          'text-lg font-semibold mb-2',
          isDark ? 'text-white' : 'text-gray-900'
        )}>
          {t('update.manual.title', 'Aggiornamenti app')}
        </Text>
        <Text className={cn(
          'text-xs leading-relaxed',
          isDark ? 'text-gray-300' : 'text-gray-600'
        )}>
          {t('update.manual.description', 'Controlla manualmente se sono disponibili aggiornamenti dell\'app. Gli aggiornamenti vengono solitamente controllati automaticamente all\'avvio.')}
        </Text>
      </View>

      {/* Stato aggiornamento */}
      {showUpdateAvailable && (
        <View className={cn(
          'p-4 rounded-lg border',
          'bg-blue-50 border-blue-200',
          'dark:bg-blue-900/20 dark:border-blue-800'
        )}>
          <Text className={cn(
            'font-medium mb-1',
            'text-blue-800 dark:text-blue-300'
          )}>
            {t('update.available.title', 'Aggiornamento disponibile')}
          </Text>
          <Text className={cn(
            'text-sm mb-3',
            'text-blue-700 dark:text-blue-400'
          )}>
            {t('update.manual.available', 'È disponibile una nuova versione dell\'app.')}
          </Text>
          <Button
            variant="primary"
            size="sm"
            onPress={handleUpdateNow}
            isLoading={updateInfo.isDownloading || updateInfo.isRestarting}
            disabled={updateInfo.isDownloading || updateInfo.isRestarting}
          >
            <Text className="text-white font-semibold">
              {updateInfo.isDownloading
                ? t('update.downloading.title', 'Download...')
                : updateInfo.isRestarting
                  ? t('update.restarting.title', 'Riavvio...')
                  : t('update.install', 'Aggiorna ora')
              }
            </Text>
          </Button>
        </View>
      )}

      {/* Errore */}
      {updateInfo.error && (
        <View className={cn(
          'p-4 rounded-lg border',
          'bg-red-50 border-red-200',
          'dark:bg-red-900/20 dark:border-red-800'
        )}>
          <Text className={cn(
            'font-medium mb-1',
            'text-red-800 dark:text-red-300'
          )}>
            {t('update.error.title', 'Errore aggiornamento')}
          </Text>
          <Text className={cn(
            'text-sm',
            'text-red-700 dark:text-red-400'
          )}>
            {updateInfo.error.message}
          </Text>
        </View>
      )}

      {/* Pulsante controllo */}
      <Button
        variant="secondary"
        onPress={handleCheckForUpdates}
        isLoading={updateInfo.isChecking}
        disabled={updateInfo.isChecking || updateInfo.isDownloading || updateInfo.isRestarting}
        className="w-full"
      >
        <Text className="font-semibold">
          {updateInfo.isChecking
            ? t('update.checking', 'Controllo in corso...')
            : t('update.manual.check', 'Controlla aggiornamenti')
          }
        </Text>
      </Button>

      {/* Info versione */}
      <View className={cn(
        'pt-2 border-t',
        'border-gray-200 dark:border-gray-700'
      )}>
        <Text className={cn(
          'text-xs text-center',
          isDark ? 'text-gray-400' : 'text-gray-500'
        )}>
          {t('update.manual.info', 'Gli aggiornamenti over-the-air permettono di ricevere nuove funzionalità senza dover scaricare l\'app dallo store.')}
        </Text>
      </View>
    </View>
  );
} 