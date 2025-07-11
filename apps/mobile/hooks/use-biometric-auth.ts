import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import { biometricUtils } from '@/lib/mmkv-storage';
import { useTranslation } from 'react-i18next';

export interface BiometricAuthHook {
  isSupported: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => void;
  authenticateWithBiometric: () => Promise<boolean>;
  checkBiometricSupport: () => Promise<void>;
}

export const useBiometricAuth = (): BiometricAuthHook => {
  const { t } = useTranslation();
  const [isSupported, setIsSupported] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supportedTypes, setSupportedTypes] = useState<LocalAuthentication.AuthenticationType[]>([]);

  // Check biometric support on mount
  useEffect(() => {
    checkBiometricSupport();
    // Load current setting from storage
    setIsEnabled(biometricUtils.getBiometricEnabled());
  }, []);

  const checkBiometricSupport = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Check if biometric authentication is available
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedAuthTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      console.log('[Biometric] Hardware support:', hasHardware);
      console.log('[Biometric] Enrolled biometrics:', isEnrolled);
      console.log('[Biometric] Supported types:', supportedAuthTypes);
      
      const supported = hasHardware && isEnrolled;
      setIsSupported(supported);
      setSupportedTypes(supportedAuthTypes);
      
      // If not supported but currently enabled, disable it
      if (!supported && biometricUtils.getBiometricEnabled()) {
        console.log('[Biometric] Device no longer supports biometrics, disabling');
        biometricUtils.setBiometricEnabled(false);
        setIsEnabled(false);
      }
    } catch (error) {
      console.error('[Biometric] Error checking support:', error);
      setIsSupported(false);
      setSupportedTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!isSupported) {
        Alert.alert(
          t('biometric.alerts.authTitle'),
          t('biometric.alerts.authNotAvailable'),
          [{ text: t('common.ok') }]
        );
        return false;
      }

      // Test biometric authentication before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric.prompts.authenticate', { type: getBiometricTypeText() }),
        fallbackLabel: t('biometric.prompts.usePasscode'),
        cancelLabel: t('biometric.prompts.cancel'),
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Save the setting
        biometricUtils.setBiometricEnabled(true);
        biometricUtils.setLastAuthenticatedTime();
        setIsEnabled(true);
        
        Alert.alert(
          t('biometric.alerts.success'),
          t('biometric.alerts.authEnabled', { type: getBiometricTypeText() }),
          [{ text: t('common.ok') }]
        );
        return true;
      } else {
        console.log('[Biometric] Authentication failed:', result.error);
        
        if (result.error === 'user_cancel') {
          // User cancelled, don't show error
          return false;
        } else if (result.error === 'system_cancel') {
          Alert.alert(
            t('biometric.alerts.authCancelled'),
            t('biometric.alerts.systemCancelled'),
            [{ text: t('common.ok') }]
          );
        } else if (result.error === 'not_available') {
          Alert.alert(
            t('biometric.alerts.notAvailable'),
            t('biometric.alerts.notAvailableNow'),
            [{ text: t('common.ok') }]
          );
        } else {
          Alert.alert(
            t('biometric.alerts.authFailed'),
            t('biometric.alerts.failedMessage'),
            [{ text: t('common.ok') }]
          );
        }
        return false;
      }
    } catch (error) {
      console.error('[Biometric] Error enabling biometric auth:', error);
      Alert.alert(
        t('biometric.alerts.error'),
        t('biometric.alerts.errorMessage'),
        [{ text: t('common.ok') }]
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, supportedTypes, t]);

  const disableBiometric = useCallback((): void => {
    try {
      biometricUtils.setBiometricEnabled(false);
      biometricUtils.setNeedsBiometricAuth(false);
      setIsEnabled(false);
      
      Alert.alert(
        t('biometric.alerts.disabled'),
        t('biometric.alerts.disabledMessage', { type: getBiometricTypeText() }),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('[Biometric] Error disabling biometric auth:', error);
    }
  }, [supportedTypes, t]);

  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      if (!isSupported || !isEnabled) {
        console.log('[Biometric] Authentication not available or not enabled');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('biometric.prompts.unlock', { type: getBiometricTypeText() }),
        fallbackLabel: t('biometric.prompts.usePasscode'),
        cancelLabel: t('biometric.prompts.cancel'),
        disableDeviceFallback: false,
      });

      if (result.success) {
        biometricUtils.setLastAuthenticatedTime();
        biometricUtils.setNeedsBiometricAuth(false);
        console.log('[Biometric] Authentication successful');
        return true;
      } else {
        console.log('[Biometric] Authentication failed:', result.error);
        return false;
      }
    } catch (error) {
      console.error('[Biometric] Error during authentication:', error);
      return false;
    }
  }, [isSupported, isEnabled, supportedTypes, t]);

  return {
    isSupported,
    isEnabled,
    isLoading,
    supportedTypes,
    enableBiometric,
    disableBiometric,
    authenticateWithBiometric,
    checkBiometricSupport,
  };
};