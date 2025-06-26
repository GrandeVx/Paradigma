import React from 'react';
import {
  Modal,
  View,
  ActivityIndicator,
  StatusBar,
  BackHandler,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/components/useColorScheme';
import { Button } from './button';
import { Text } from './text';
import { cn } from '@/lib/utils';
import { UpdateInfo } from '@/hooks/use-expo-updates';
import { useTranslation } from 'react-i18next';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: UpdateInfo;
  onUpdatePress: () => void;
  onDismiss: () => void;
  onCancel?: () => void;
}

export function UpdateModal({
  visible,
  updateInfo,
  onUpdatePress,
  onDismiss,
  onCancel,
}: UpdateModalProps) {
  const colorScheme = useColorScheme();
  const { t } = useTranslation();
  const isDark = colorScheme === 'dark';

  // Previene la chiusura del modal durante il download/restart
  React.useEffect(() => {
    const handleBackPress = () => {
      if (updateInfo.isDownloading || updateInfo.isRestarting) {
        return true; // Previene la chiusura
      }
      onDismiss();
      return true;
    };

    if (visible) {
      const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      return () => subscription.remove();
    }
  }, [visible, updateInfo.isDownloading, updateInfo.isRestarting, onDismiss]);

  const getTitle = () => {
    if (updateInfo.isRestarting) {
      return t('update.restarting.title', 'Riavvio in corso...');
    }
    if (updateInfo.isDownloading) {
      return t('update.downloading.title', 'Download in corso...');
    }
    if (updateInfo.error) {
      return t('update.error.title', 'Errore aggiornamento');
    }
    return t('update.available.title', 'Aggiornamento disponibile');
  };

  const getMessage = () => {
    if (updateInfo.isRestarting) {
      return t('update.restarting.message', 'L\'app si riavvierà tra qualche istante per applicare l\'aggiornamento.');
    }
    if (updateInfo.isDownloading) {
      return t('update.downloading.message', 'Stiamo scaricando l\'aggiornamento. Questo potrebbe richiedere qualche minuto...');
    }
    if (updateInfo.error) {
      return t('update.error.message', 'Si è verificato un errore durante l\'aggiornamento: {{error}}', {
        error: updateInfo.error.message,
      });
    }
    return t('update.available.message', 'È disponibile una nuova versione dell\'app con miglioramenti e correzioni. Vuoi aggiornarla ora?');
  };

  const showProgressIndicator = updateInfo.isDownloading || updateInfo.isRestarting;
  const showActionButtons = !updateInfo.isDownloading && !updateInfo.isRestarting;

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Background Blur */}
      <BlurView
        intensity={20}
        tint={isDark ? 'dark' : 'light'}
        className="flex-1 justify-center items-center p-6"
      >
        {/* Modal Container */}
        <View
          className={cn(
            'w-full max-w-sm mx-auto rounded-2xl p-6 shadow-lg',
            'border border-gray-200/20',
            isDark ? 'bg-gray-900/95' : 'bg-white/95'
          )}
        >
          {/* Content */}
          <View className="items-center space-y-4">
            {/* Icon/Progress */}
            <View className="mb-2">
              {showProgressIndicator ? (
                <ActivityIndicator
                  size="large"
                  color={isDark ? '#3B82F6' : '#1D4ED8'}
                />
              ) : updateInfo.error ? (
                <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 items-center justify-center">
                  <Text className="text-2xl">⚠️</Text>
                </View>
              ) : (
                <View className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center">
                  <Text className="text-2xl">📱</Text>
                </View>
              )}
            </View>

            {/* Title */}
            <Text className={cn(
              'text-xl font-bold text-center',
              isDark ? 'text-white' : 'text-gray-900'
            )}>
              {getTitle()}
            </Text>

            {/* Message */}
            <Text className={cn(
              'text-base text-center leading-relaxed',
              isDark ? 'text-gray-300' : 'text-gray-600'
            )}>
              {getMessage()}
            </Text>

            {/* Version Info */}
            {updateInfo.manifest && !updateInfo.error && (
              <View className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Text className={cn(
                  'text-sm text-center',
                  isDark ? 'text-gray-400' : 'text-gray-500'
                )}>
                  {t('update.version', 'Versione')}: {updateInfo.manifest.createdAt
                    ? new Date(updateInfo.manifest.createdAt).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    : 'N/A'
                  }
                </Text>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          {showActionButtons && (
            <View className="mt-6 space-y-3">
              {updateInfo.error ? (
                // Error state - solo pulsante chiudi
                <Button
                  variant="primary"
                  onPress={onDismiss}
                  className="w-full"
                >
                  <Text className="text-white font-semibold">
                    {t('update.close', 'Chiudi')}
                  </Text>
                </Button>
              ) : (
                // Normal state - pulsanti aggiorna e annulla
                <>
                  <Button
                    variant="primary"
                    onPress={onUpdatePress}
                    className="w-full"
                  >
                    <Text className="text-white font-semibold">
                      {t('update.install', 'Aggiorna ora')}
                    </Text>
                  </Button>

                  <Button
                    variant="secondary"
                    onPress={onCancel || onDismiss}
                    className="w-full"
                  >
                    <Text className="font-semibold">
                      {t('update.later', 'Più tardi')}
                    </Text>
                  </Button>
                </>
              )}
            </View>
          )}
        </View>
      </BlurView>
    </Modal>
  );
} 