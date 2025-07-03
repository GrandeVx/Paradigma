import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, Pressable, Alert } from 'react-native';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withRepeat,
    runOnJS
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/ui/svg-icon';
import { IconName } from '@/components/ui/icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { InvalidationUtils } from '@/lib/invalidation-utils';
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

// Account Deletion Loading State Component
const AccountDeletionLoadingState: React.FC = () => {
    const { t } = useTranslation();
    const pulseOpacity = useSharedValue(0.3);

    useEffect(() => {
        const animate = () => {
            pulseOpacity.value = withRepeat(
                withTiming(1, { duration: 1500 }, () => {
                    pulseOpacity.value = withTiming(0.3, { duration: 1500 }, () => {
                        runOnJS(animate)();
                    });
                }),
                -1,
                true
            );
        };
        animate();
    }, [pulseOpacity]);

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: pulseOpacity.value,
    }));

    return (
        <HeaderContainer variant="secondary" customTitle={t("account.details.title", "MODIFICA CONTO")} tabBarHidden={true}>
            <View className="flex-1 bg-white">
                <Animated.View
                    entering={FadeIn.duration(400)}
                    className="flex-1 items-center justify-center gap-6 px-10"
                >
                    {/* Animated Icons */}
                    <View className="flex-row items-center justify-center mb-4" style={{ height: 100 }}>
                        <Animated.View
                            style={[
                                pulseStyle,
                                {
                                    position: 'absolute',
                                    left: 40,
                                    backgroundColor: '#FEF2F2',
                                    transform: [{ rotate: '-12deg' }],
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 28,
                                    elevation: 8,
                                    zIndex: 1
                                }
                            ]}
                            className="rounded-2xl p-5"
                        >
                            <Text className="text-4xl">🗑️</Text>
                        </Animated.View>

                        <Animated.View
                            style={[
                                pulseStyle,
                                {
                                    backgroundColor: '#FFF7ED',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 28,
                                    elevation: 10,
                                    zIndex: 3
                                }
                            ]}
                            className="rounded-2xl p-5"
                        >
                            <Text className="text-4xl">🏦</Text>
                        </Animated.View>

                        <Animated.View
                            style={[
                                pulseStyle,
                                {
                                    position: 'absolute',
                                    right: 40,
                                    backgroundColor: '#F0F9FF',
                                    transform: [{ rotate: '12deg' }],
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 6 },
                                    shadowOpacity: 0.15,
                                    shadowRadius: 28,
                                    elevation: 8,
                                    zIndex: 2
                                }
                            ]}
                            className="rounded-2xl p-5"
                        >
                            <Text className="text-4xl">💸</Text>
                        </Animated.View>
                    </View>

                    {/* Main Message */}
                    <View className="items-center gap-3">
                        <Text
                            className="text-black text-center font-medium text-xl"
                            style={{ fontFamily: 'DM Sans', fontSize: 20, lineHeight: 28 }}
                        >
                            Eliminazione in corso...
                        </Text>

                        <Text
                            className="text-gray-600 text-center leading-6"
                            style={{ fontFamily: 'DM Sans', fontSize: 16, lineHeight: 22 }}
                        >
                            Stiamo rimuovendo tutte le transazioni e i dati associati al conto.
                        </Text>
                    </View>



                    {/* Progress Indicator */}
                    <View className="items-center gap-2 mt-4">
                        <Animated.View
                            style={[
                                pulseStyle,
                                {
                                    width: 40,
                                    height: 4,
                                    backgroundColor: '#3B82F6',
                                    borderRadius: 2
                                }
                            ]}
                        />
                        <Text
                            className="text-gray-500 text-sm"
                            style={{ fontFamily: 'DM Sans' }}
                        >
                            Elaborazione dati...
                        </Text>
                    </View>
                </Animated.View>
            </View>
        </HeaderContainer>
    );
};

export default function AccountDetailsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [isSaving, setIsSaving] = useState(false);
    const [isShowingDeleteConfirm, setIsShowingDeleteConfirm] = useState(false);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Overlay states
    const [showIconOverlay, setShowIconOverlay] = useState(false);
    const [showColorOverlay, setShowColorOverlay] = useState(false);

    // Animation values - using Reanimated
    const backdropOpacity = useSharedValue(0);
    const contentOpacity = useSharedValue(1);
    const iconPanelScale = useSharedValue(0);
    const iconPanelTranslateY = useSharedValue(-20);
    const colorPanelScale = useSharedValue(0);
    const colorPanelTranslateY = useSharedValue(-20);

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
            setIsDeletingAccount(false);
            router.back();
        },
        onError: (error) => {
            setError(error.message);
            setIsShowingDeleteConfirm(false);
            setIsDeletingAccount(false);
        }
    });

    // Get all transactions for this account to delete them
    const { data: accountTransactions } = api.transaction.list.useQuery(
        { accountId: id },
        { enabled: !!id }
    );

    // Delete transaction mutation
    const { mutate: deleteTransaction } = api.transaction.delete.useMutation();

    // Animation cleanup effect - MEMORY LEAK PREVENTION (not needed for Reanimated shared values)
    useEffect(() => {
        return () => {
            // Cleanup for Reanimated is automatic
        };
    }, []);

    // Animation effects
    useEffect(() => {
        if (showIconOverlay) {
            // Show icon overlay with animation
            backdropOpacity.value = withTiming(1, { duration: 200 });
            contentOpacity.value = withTiming(0.1, { duration: 200 });
            iconPanelScale.value = withTiming(1, { duration: 250 });
            iconPanelTranslateY.value = withTiming(0, { duration: 250 });
        } else {
            // Hide icon overlay with animation
            backdropOpacity.value = withTiming(0, { duration: 200 });
            contentOpacity.value = withTiming(1, { duration: 200 });
            iconPanelScale.value = withTiming(0, { duration: 200 });
            iconPanelTranslateY.value = withTiming(-20, { duration: 200 });
        }
    }, [showIconOverlay, backdropOpacity, contentOpacity, iconPanelScale, iconPanelTranslateY]);

    useEffect(() => {
        if (showColorOverlay) {
            // Show color overlay with animation
            backdropOpacity.value = withTiming(1, { duration: 200 });
            contentOpacity.value = withTiming(0.1, { duration: 200 });
            colorPanelScale.value = withTiming(1, { duration: 250 });
            colorPanelTranslateY.value = withTiming(0, { duration: 250 });
        } else {
            // Hide color overlay with animation
            backdropOpacity.value = withTiming(0, { duration: 200 });
            contentOpacity.value = withTiming(1, { duration: 200 });
            colorPanelScale.value = withTiming(0, { duration: 200 });
            colorPanelTranslateY.value = withTiming(-20, { duration: 200 });
        }
    }, [showColorOverlay, backdropOpacity, contentOpacity, colorPanelScale, colorPanelTranslateY]);

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

    const handleAccountDeletion = async () => {
        try {
            setIsDeletingAccount(true);
            console.log('🗑️ [AccountDelete] Starting account deletion process...');

            if (accountTransactions && accountTransactions.items && accountTransactions.items.length > 0) {
                console.log(`🗑️ [AccountDelete] Found ${accountTransactions.items.length} transactions to delete`);

                // Group transactions by month/year for invalidation tracking
                const affectedMonths = new Set<string>();

                // Group transactions by category for invalidation tracking
                const affectedCategories = new Set<string>();

                // Delete all transactions first
                for (const transaction of accountTransactions.items) {
                    const transactionDate = new Date(transaction.date);
                    const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}`;
                    affectedMonths.add(monthKey);

                    // Track affected categories for invalidation
                    if (transaction.subCategoryId) {
                        affectedCategories.add(transaction.subCategoryId);
                    }

                    console.log(`🗑️ [AccountDelete] Deleting transaction ${transaction.id} from ${monthKey}`);

                    await new Promise<void>((resolve, reject) => {
                        deleteTransaction(
                            { transactionId: transaction.id },
                            {
                                onSuccess: () => {
                                    console.log(`✅ [AccountDelete] Transaction ${transaction.id} deleted`);
                                    resolve();
                                },
                                onError: (error) => {
                                    console.error(`❌ [AccountDelete] Failed to delete transaction ${transaction.id}:`, error);
                                    reject(error);
                                }
                            }
                        );
                    });
                }

                console.log(`🔄 [AccountDelete] All transactions deleted. Invalidating ${affectedMonths.size} affected months and ${affectedCategories.size} affected categories...`);

                // We need to get category data to map subcategories to macro categories
                const { data: allCategories } = await utils.category.list.fetch({});

                // Invalidate cache for all affected months
                for (const monthKey of affectedMonths) {
                    const [year, month] = monthKey.split('-').map(Number);

                    try {
                        await InvalidationUtils.invalidateTransactionRelatedQueries(utils, {
                            currentMonth: month,
                            currentYear: year,
                            clearCache: true,
                        });

                        await InvalidationUtils.invalidateChartsQueries(utils, {
                            currentMonth: month,
                            currentYear: year,
                        });

                        console.log(`✅ [AccountDelete] Invalidated cache for ${monthKey}`);
                    } catch (invalidationError) {
                        console.warn(`⚠️ [AccountDelete] Failed to invalidate ${monthKey}:`, invalidationError);
                    }
                }

                // Invalidate category-specific queries for all affected categories
                if (allCategories && affectedCategories.size > 0) {
                    for (const subCategoryId of affectedCategories) {
                        // Find the macro category for this subcategory
                        const macroCategory = allCategories.find(cat => 
                            cat.subCategories.some(sub => sub.id === subCategoryId)
                        );

                        if (macroCategory) {
                            // Invalidate for all affected months
                            for (const monthKey of affectedMonths) {
                                const [year, month] = monthKey.split('-').map(Number);

                                try {
                                    await InvalidationUtils.invalidateCategoryQueries(utils, {
                                        categoryId: macroCategory.id,
                                        currentMonth: month,
                                        currentYear: year,
                                    });

                                    console.log(`✅ [AccountDelete] Invalidated category ${macroCategory.id} for ${monthKey}`);
                                } catch (invalidationError) {
                                    console.warn(`⚠️ [AccountDelete] Failed to invalidate category ${macroCategory.id} for ${monthKey}:`, invalidationError);
                                }
                            }
                        }
                    }
                }
            } else {
                console.log('ℹ️ [AccountDelete] No transactions found for this account');
            }

            // Finally, delete the account
            console.log('🗑️ [AccountDelete] Deleting account...');
            deleteAccount({ accountId: id });

        } catch (error) {
            console.error('❌ [AccountDelete] Error during account deletion:', error);
            setError(error instanceof Error ? error.message : "Errore durante l'eliminazione del conto");
            setIsShowingDeleteConfirm(false);
            setIsDeletingAccount(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(
            t("account.details.delete_confirm_title", "Eliminare questo conto?"),
            t("account.details.delete_confirm_msg", "Questa azione non può essere annullata. Tutte le transazioni associate a questo conto verranno eliminate definitivamente."),
            [
                {
                    text: t("common.actions.cancel", "Annulla"),
                    style: "cancel"
                },
                {
                    text: t("common.actions.delete", "Elimina"),
                    onPress: () => {
                        setIsShowingDeleteConfirm(true);
                        handleAccountDeletion();
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

    // Animated styles for overlays
    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }));

    const iconPanelStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: iconPanelScale.value },
            { translateY: iconPanelTranslateY.value }
        ],
        opacity: backdropOpacity.value,
    }));

    const colorPanelStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: colorPanelScale.value },
            { translateY: colorPanelTranslateY.value }
        ],
        opacity: backdropOpacity.value,
    }));

    if (isLoadingAccount || isLoadingBalance) {
        return <AccountDetailsSkeleton />;
    }

    if (isDeletingAccount) {
        return <AccountDeletionLoadingState />;
    }

    return (
        <HeaderContainer variant="secondary" customTitle={t("account.details.title", "MODIFICA CONTO")} tabBarHidden={true}>
            <View className="flex-1 bg-white">
                {/* Main content in ScrollView with animation */}
                <Animated.View
                    className="flex-1"
                    style={contentStyle}
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
                                isLoading={isShowingDeleteConfirm || isDeleting || isDeletingAccount}
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
                        style={backdropStyle}
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
                        style={[
                            iconPanelStyle,
                            {
                                top: 16,
                                left: 16,
                                width: 56,
                            }
                        ]}
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
                        style={[
                            colorPanelStyle,
                            {
                                top: 16,
                                right: 16,
                                width: 56,
                            }
                        ]}
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