import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Alert, BackHandler } from 'react-native';
import { useBiometricAuth } from '@/hooks/use-biometric-auth';
import { SvgIcon } from '@/components/ui/svg-icon';
import { Button } from '@/components/ui/button';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation } from 'react-i18next';

interface BiometricAuthScreenProps {
  onAuthSuccess: () => void;
  onAuthFailure?: () => void;
}

export const BiometricAuthScreen: React.FC<BiometricAuthScreenProps> = ({
  onAuthSuccess,
  onAuthFailure
}) => {
  const { t } = useTranslation();
  const { authenticateWithBiometric, supportedTypes } = useBiometricAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [hasTriedAutoAuth, setHasTriedAutoAuth] = useState(false);
  const [authAttempts, setAuthAttempts] = useState(0);

  // Get biometric type text
  const getBiometricTypeText = (): string => {
    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return t('biometric.types.faceId');
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return t('biometric.types.touchId');
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return t('biometric.types.iris');
    }
    return t('biometric.types.biometric');
  };

  // Get biometric icon name  
  const getBiometricIcon = (): "next" => {
    // Always return shield since it's the only valid icon type available
    return 'next';
  };

  // Auto-trigger biometric authentication on mount and retry
  useEffect(() => {
    if (!hasTriedAutoAuth) {
      setHasTriedAutoAuth(true);
      // Trigger immediately on mount
      setTimeout(() => {
        handleBiometricAuth();
      }, 500); // Small delay to ensure UI is ready
    }
  }, []);

  // Auto-retry mechanism
  useEffect(() => {
    if (authAttempts > 0 && authAttempts < 3 && !isAuthenticating) {
      // Auto-retry after 2 seconds for up to 3 attempts
      const retryTimer = setTimeout(() => {
        handleBiometricAuth();
      }, 2000);

      return () => clearTimeout(retryTimer);
    }
  }, [authAttempts, isAuthenticating]);

  // Handle hardware back button on Android
  useEffect(() => {
    const backAction = () => {
      // Prevent back button from dismissing the auth screen
      handleExitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  const handleBiometricAuth = async () => {
    try {
      setIsAuthenticating(true);
      const success = await authenticateWithBiometric();

      if (success) {
        onAuthSuccess();
      } else {
        // Authentication failed or cancelled
        setIsAuthenticating(false);
        setAuthAttempts(prev => prev + 1);
      }
    } catch (error) {
      console.error('[BiometricAuthScreen] Authentication error:', error);
      setIsAuthenticating(false);
      setAuthAttempts(prev => prev + 1);
    }
  };

  const handleExitApp = () => {
    Alert.alert(
      t('biometric.alerts.exitApp.title'),
      t('biometric.alerts.exitApp.message'),
      [
        {
          text: t('biometric.alerts.exitApp.cancel'),
          style: 'cancel',
        },
        {
          text: t('biometric.alerts.exitApp.exit'),
          style: 'destructive',
          onPress: () => {
            onAuthFailure?.();
            BackHandler.exitApp();
          },
        },
      ]
    );
  };


  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* App Logo/Icon */}
      <View className="mb-12">
        <View className="w-24 h-24 bg-primary-600 rounded-3xl items-center justify-center mb-6">
          <Text className="text-4xl font-bold text-white">{t('biometric.appInfo.logoLetter')}</Text>
        </View>
        <Text className="text-2xl font-bold text-center text-gray-900 mb-2">
          {t('biometric.appInfo.name')}
        </Text>
        <Text className="text-lg text-center text-gray-600">
          {t('biometric.appInfo.tagline')}
        </Text>
      </View>

      {/* Biometric Icon */}
      <View className="mb-8">
        <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
          <SvgIcon
            name={getBiometricIcon()}
            size={40}
            color="#6B7280"
          />
        </View>
        <Text className="text-xl font-semibold text-center text-gray-900 mb-2">
          {t('biometric.authentication.unlockWith', { type: getBiometricTypeText() })}
        </Text>
        <Text className="text-base text-center text-gray-600 leading-6">
          {t('biometric.authentication.useToAccess', { type: getBiometricTypeText() })}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="w-full max-w-sm space-y-4">
        <Button
          variant="primary"
          size="lg"
          onPress={handleBiometricAuth}
          isLoading={isAuthenticating}
          disabled={isAuthenticating}
          className="w-full"
        >
          <Text className="text-white font-semibold text-lg">
            {isAuthenticating ? t('biometric.authentication.authenticating') :
              authAttempts >= 3 ? t('biometric.authentication.tryAgain') :
                t('biometric.authentication.use', { type: getBiometricTypeText() })}
          </Text>
        </Button>

        {authAttempts >= 3 && (
          <View className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 text-sm text-center">
              {t('biometric.status.multipleFailures')}
            </Text>
          </View>
        )}

        <Pressable
          onPress={handleExitApp}
          className="py-3 px-4 rounded-lg"
          disabled={isAuthenticating}
        >
          <Text className="text-red-600 font-medium text-center">
            {t('biometric.alerts.exitApp.title')}
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View className="absolute bottom-8 left-8 right-8">
        <Text className="text-sm text-gray-500 text-center leading-5">
          {t('biometric.status.protectionMessage')}
          {authAttempts > 0 && authAttempts < 3 && ` ${t('biometric.status.attemptingAuth', { current: authAttempts })}`}
        </Text>
      </View>
    </View>
  );
};