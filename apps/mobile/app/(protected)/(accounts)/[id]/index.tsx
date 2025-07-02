import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, Pressable, Alert, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/ui/svg-icon';
import { IconName } from '@/components/ui/icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
// Removed cn import as it's no longer used with modular components
import { AccountColors, AccountIcons } from "@/components/ui/icons";
import AccountDetailsSkeleton from './skeleton';

// Import modular components for better performance
import { AccountHeader } from './components/account-header';
import { SettingsForm } from './components/settings-form';
import { RecentTransactions } from './components/recent-transactions';

// Format currency helper
const formatCurrency = (amount: number) => {
    const [integer, decimal] = amount.toFixed(2).split('.');
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return {
        integer: formattedInteger,
        decimal: decimal
    };
};

export default function AccountDetailsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [isSaving, setIsSaving] = useState(false);
    const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Overlay states
    const [showIconOverlay, setShowIconOverlay] = useState(false);
    const [showColorOverlay, setShowColorOverlay] = useState(false);

    // Animation values
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const contentOpacity = useRef(new Animated.Value(1)).current;
    const iconPanelScale = useRef(new Animated.Value(0)).current;
    const iconPanelTranslateY = useRef(new Animated.Value(-20)).current;
    const colorPanelScale = useRef(new Animated.Value(0)).current;
    const colorPanelTranslateY = useRef(new Animated.Value(-20)).current;

    // Form states
    const [accountName, setAccountName] = useState('');
    const [isDefaultAccount, setIsDefaultAccount] = useState(false);
    const [isSavingsAccount, setIsSavingsAccount] = useState(false);
    const [savingTarget, setSavingTarget] = useState('');
    const [accountColor, setAccountColor] = useState('#409FF8');
    const [accountIcon, setAccountIcon] = useState<IconName>('bank-card');
    const [balance, setBalance] = useState(0);
    const [includeInTotal, setIncludeInTotal] = useState(false);

    // Get account details - OPTIMIZED
    const { data: accountData, isLoading: isLoadingAccount } = api.account.getById.useQuery(
        { accountId: id },
        {
            enabled: !!id,
            staleTime: 30000,
            cacheTime: 300000,
            refetchOnWindowFocus: false,
        }
    );

    // Get account balance - OPTIMIZED
    const { data: balanceData, isLoading: isLoadingBalance } = api.account.listWithBalances.useQuery({}, {
        staleTime: 30000,
        cacheTime: 300000,
        refetchOnWindowFocus: false,
    });

    // Get last 3 transactions for this account - OPTIMIZED
    const { data: transactionsData, isLoading: isLoadingTransactions } = api.transaction.list.useQuery(
        { accountId: id, limit: 3 },
        {
            enabled: !!id,
            staleTime: 30000,
            cacheTime: 300000,
            refetchOnWindowFocus: false,
        }
    );

    const utils = api.useUtils();

    // Update account mutation - OPTIMIZED INVALIDATION
    const { mutate: updateAccount, isLoading: isUpdating } = api.account.update.useMutation({
        onSuccess: async () => {
            // Only invalidate specific queries that actually need updates
            await utils.account.listWithBalances.invalidate();
            await utils.account.getById.invalidate({ accountId: id });
            // Don't invalidate transactions unless account changes affect them
            setIsSaving(false);
            router.back();
        },
        onError: (error) => {
            setError(error.message);
            setIsSaving(false);
        }
    });

    // Delete account mutation - OPTIMIZED INVALIDATION
    const { mutate: deleteAccount, isLoading: isDeleting } = api.account.delete.useMutation({
        onSuccess: async () => {
            // Only invalidate account list when account is deleted
            await utils.account.listWithBalances.invalidate();
            setIsShowingDeleteConfirm(false);
            router.back();
        },
        onError: (error) => {
            setError(error.message);
            setIsShowingDeleteConfirm(false);
        }
    });

    // Animation cleanup effect - MEMORY LEAK PREVENTION
    useEffect(() => {
        return () => {
            // Cleanup animations to prevent memory leaks
            backdropOpacity.removeAllListeners();
            contentOpacity.removeAllListeners();
            iconPanelScale.removeAllListeners();
            iconPanelTranslateY.removeAllListeners();
            colorPanelScale.removeAllListeners();
            colorPanelTranslateY.removeAllListeners();
        };
    }, []);

    // Animation effects
    useEffect(() => {
        if (showIconOverlay) {
            // Show icon overlay with animation
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 0.1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(iconPanelScale, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(iconPanelTranslateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Hide icon overlay with animation
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(iconPanelScale, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(iconPanelTranslateY, {
                    toValue: -20,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showIconOverlay]);

    useEffect(() => {
        if (showColorOverlay) {
            // Show color overlay with animation
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 0.1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(colorPanelScale, {
                    toValue: 1,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(colorPanelTranslateY, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            // Hide color overlay with animation
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(colorPanelScale, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(colorPanelTranslateY, {
                    toValue: -20,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [showColorOverlay]);

    // Find account balance from the accounts list
    useEffect(() => {
        if (balanceData && id) {
            const accountWithBalance = balanceData.find(item => item.account.id === id);
            if (accountWithBalance) {
                setBalance(Number(accountWithBalance.balance));
            }
        }
    }, [balanceData, id]);

    // Populate form data when account data is loaded
    useEffect(() => {
        if (accountData) {
            setAccountName(accountData.name);
            setIsDefaultAccount(accountData.default);
            setIsSavingsAccount(accountData.isGoalAccount || false);
            setSavingTarget(accountData.targetAmount ? accountData.targetAmount.toString() : '');
            setAccountColor(accountData.color || AccountColors[accountData.iconName as keyof typeof AccountColors] || '#409FF8');
            setAccountIcon(accountData.iconName as IconName || 'bank-card');
            setIncludeInTotal(accountData.includeInTotal || false); // This could be a field in the account model
        }
    }, [accountData]);

    const handleSave = () => {
        setIsSaving(true);
        setError(null);

        try {
            updateAccount({
                accountId: id,
                default: isDefaultAccount,
                isGoalAccount: isSavingsAccount,
                targetAmount: isSavingsAccount ? parseFloat(savingTarget) : null,
                color: accountColor,
                iconName: accountIcon,
                includeInTotal: includeInTotal,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error updating account");
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t("account.details.delete_confirm_title", "Eliminare questo conto?"),
            t("account.details.delete_confirm_msg", "Questa azione non può essere annullata. Tutte le transazioni associate a questo conto verranno mantenute."),
            [
                {
                    text: t("common.actions.cancel", "Annulla"),
                    style: "cancel"
                },
                {
                    text: t("common.actions.delete", "Elimina"),
                    onPress: () => {
                        setIsShowingDeleteConfirm(true);
                        deleteAccount({ accountId: id });
                    },
                    style: "destructive"
                }
            ]
        );
    };

    // Currency formatting now handled in AccountHeader component

    // If account has a savings goal, calculate progress
    const progress = useMemo(() => {
        if (isSavingsAccount && savingTarget) {
            const targetAmount = parseFloat(savingTarget.replace(".", ""));
            if (!isNaN(targetAmount) && targetAmount > 0) {
                return Math.min(100, (balance / targetAmount) * 100);
            }
        }
        return 0;
    }, [isSavingsAccount, savingTarget, balance]);

    // Calculate remaining amount
    const remaining = useMemo(() => {
        if (isSavingsAccount && savingTarget) {
            const targetAmount = parseFloat(savingTarget.replace(",", "."));
            if (!isNaN(targetAmount) && targetAmount > 0) {
                return Math.max(0, targetAmount - balance);
            }
        }
        return 0;
    }, [isSavingsAccount, savingTarget, balance]);

    const { integer: remainingInteger, decimal: remainingDecimal } = formatCurrency(remaining);

    const handleIconSelect = (icon: IconName) => {
        setAccountIcon(icon);
        setShowIconOverlay(false);
    };

    const handleColorSelect = (color: string) => {
        setAccountColor(color);
        setShowColorOverlay(false);
    };

    const closeOverlays = () => {
        setShowIconOverlay(false);
        setShowColorOverlay(false);
    };

    if (isLoadingAccount || isLoadingBalance) {
        return <AccountDetailsSkeleton />;
    }

    return (
        <HeaderContainer variant="secondary" customTitle={t("account.details.title", "MODIFICA CONTO")} tabBarHidden={true}>
            <View className="flex-1 bg-white">
                {/* Main content in ScrollView with animation */}
                <Animated.View
                    className="flex-1"
                    style={{ opacity: contentOpacity }}
                    pointerEvents={(showIconOverlay || showColorOverlay) ? 'none' : 'auto'}
                >
                    <ScrollView
                        className="flex-1 bg-gray-100"
                        contentContainerStyle={{ paddingBottom: 120 }} // Extra padding for fixed button
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Account header with icon, name, and color - MODULARIZED for performance */}
                        <AccountHeader
                            name={accountName}
                            icon={accountIcon}
                            color={accountColor}
                            balance={balance}
                            onNamePress={() => router.push(`/(protected)/(accounts)/${id}/edit-name`)}
                            onIconPress={() => setShowIconOverlay(true)}
                            onColorPress={() => setShowColorOverlay(true)}
                            onBalancePress={() => router.push(`/(protected)/(accounts)/${id}/edit-balance`)}
                        />

                        {/* Progress bar for savings accounts */}
                        {isSavingsAccount && savingTarget && (
                            <View className="px-4 pb-4">
                                <View className="h-2 w-full rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
                                    <View
                                        className="h-full rounded-full"
                                        style={{
                                            backgroundColor: accountColor,
                                            width: `${progress}%`
                                        }}
                                    />
                                </View>
                                <Text className="text-xs font-medium text-gray-500">
                                    {remaining > 0
                                        ? `Ancora € ${remainingInteger},${remainingDecimal} per completare l'obiettivo`
                                        : 'Obiettivo raggiunto!'}
                                </Text>
                            </View>
                        )}


                        {/* Account Settings Form - MODULARIZED for performance */}
                        <SettingsForm
                            includeInTotal={includeInTotal}
                            setIncludeInTotal={setIncludeInTotal}
                            isDefaultAccount={isDefaultAccount}
                            setIsDefaultAccount={setIsDefaultAccount}
                            isSavingsAccount={isSavingsAccount}
                            setIsSavingsAccount={setIsSavingsAccount}
                            savingTarget={savingTarget}
                            setSavingTarget={setSavingTarget}
                        />


                        {/* Recent Transactions Section - MODULARIZED for performance */}
                        <RecentTransactions
                            transactions={transactionsData?.items || []}
                            isLoading={isLoadingTransactions}
                            onSeeAllPress={() => router.push(`/(protected)/(accounts)/${id}/transactions`)}
                        />


                        {/* Delete Account Button */}
                        <View className="px-4 bg-white mt-3 py-6">
                            <Button
                                variant="destructive"
                                size="lg"
                                rounded="default"
                                onPress={handleDelete}
                                className="w-full font-semibold font-sans "
                                isLoading={isShowingDeleteConfirm || isDeleting}
                            >
                                <Text className="text-white font-semibold">
                                    {t("account.details.delete_account", "Elimina questo conto")}
                                </Text>
                            </Button>
                        </View>
                    </ScrollView>

                    {/* Fixed Save Button at bottom with animation */}
                    <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-2 bg-white border-t border-gray-200">
                        <Button
                            variant="primary"
                            size="lg"
                            rounded="default"
                            onPress={handleSave}
                            className="w-full font-semibold font-sans"
                            isLoading={isSaving || isUpdating}
                        >
                            <Text className="text-white font-semibold">
                                {t("common.actions.save", "Salva")}
                            </Text>
                        </Button>
                    </View>
                </Animated.View>

                {/* Animated Backdrop */}
                {(showIconOverlay || showColorOverlay) && (
                    <Animated.View
                        className="absolute inset-0"
                        style={{ opacity: backdropOpacity }}
                    >
                        <Pressable
                            className="flex-1"
                            style={{ backgroundColor: 'transparent' }}
                            onPress={closeOverlays}
                        />
                    </Animated.View>
                )}

                {/* Icon Selection Overlay with animation */}
                {showIconOverlay && (
                    <Animated.View
                        className="absolute bg-gray-50 rounded-xl p-1"
                        style={{
                            top: 16,
                            left: 16,
                            width: 56,
                            opacity: backdropOpacity,
                            transform: [
                                { scale: iconPanelScale },
                                { translateY: iconPanelTranslateY }
                            ]
                        }}
                    >
                        {Object.values(AccountIcons).map((icon) => (
                            <Pressable
                                key={icon}
                                className="p-3"
                                onPress={() => handleIconSelect(icon as IconName)}
                            >
                                <SvgIcon name={icon as IconName} width={24} height={24} color="#000000" />
                            </Pressable>
                        ))}
                    </Animated.View>
                )}

                {/* Color Selection Overlay with animation */}
                {showColorOverlay && (
                    <Animated.View
                        className="absolute bg-gray-50 rounded-xl p-1"
                        style={{
                            top: 16,
                            right: 16,
                            width: 56,
                            opacity: backdropOpacity,
                            transform: [
                                { scale: colorPanelScale },
                                { translateY: colorPanelTranslateY }
                            ]
                        }}
                    >
                        {Object.values(AccountColors).map((color) => (
                            <Pressable
                                key={color}
                                className="p-3"
                                onPress={() => handleColorSelect(color)}
                            >
                                <View
                                    className="w-6 h-6 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                            </Pressable>
                        ))}
                    </Animated.View>
                )}

                {/* Error message */}
                {error && (
                    <View className="px-4 py-2 absolute bottom-20 left-0 right-0">
                        <Text className="text-red-500">{error}</Text>
                    </View>
                )}
            </View>
        </HeaderContainer>
    );
} 