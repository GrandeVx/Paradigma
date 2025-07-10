import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import { biometricUtils } from '@/lib/mmkv-storage';

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
      return 'Face ID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biometric';
  };

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!isSupported) {
        Alert.alert(
          'Biometric Authentication',
          'Biometric authentication is not available on this device or no biometrics are enrolled.',
          [{ text: 'OK' }]
        );
        return false;
      }

      // Test biometric authentication before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authenticate with ${getBiometricTypeText()}`,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Save the setting
        biometricUtils.setBiometricEnabled(true);
        biometricUtils.setLastAuthenticatedTime();
        setIsEnabled(true);
        
        Alert.alert(
          'Success',
          `${getBiometricTypeText()} authentication has been enabled for this app.`,
          [{ text: 'OK' }]
        );
        return true;
      } else {
        console.log('[Biometric] Authentication failed:', result.error);
        
        if (result.error === 'user_cancel') {
          // User cancelled, don't show error
          return false;
        } else if (result.error === 'system_cancel') {
          Alert.alert(
            'Authentication Cancelled',
            'The system cancelled the authentication process.',
            [{ text: 'OK' }]
          );
        } else if (result.error === 'not_available') {
          Alert.alert(
            'Not Available',
            'Biometric authentication is not available at this time.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Authentication Failed',
            'Could not authenticate with biometrics. Please try again.',
            [{ text: 'OK' }]
          );
        }
        return false;
      }
    } catch (error) {
      console.error('[Biometric] Error enabling biometric auth:', error);
      Alert.alert(
        'Error',
        'An error occurred while setting up biometric authentication.',
        [{ text: 'OK' }]
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, supportedTypes]);

  const disableBiometric = useCallback((): void => {
    try {
      biometricUtils.setBiometricEnabled(false);
      biometricUtils.setNeedsBiometricAuth(false);
      setIsEnabled(false);
      
      Alert.alert(
        'Disabled',
        `${getBiometricTypeText()} authentication has been disabled for this app.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('[Biometric] Error disabling biometric auth:', error);
    }
  }, [supportedTypes]);

  const authenticateWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      if (!isSupported || !isEnabled) {
        console.log('[Biometric] Authentication not available or not enabled');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Unlock with ${getBiometricTypeText()}`,
        fallbackLabel: 'Use Passcode',
        cancelLabel: 'Cancel',
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
  }, [isSupported, isEnabled, supportedTypes]);

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