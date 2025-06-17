import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, ScrollView, TextInput, Switch, Pressable, Alert, Animated } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { SvgIcon } from '@/components/ui/svg-icon';
import { IconName } from '@/components/ui/icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import HeaderContainer from '@/components/layouts/_header';
import { api } from '@/lib/api';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { AccountColors, AccountIcons } from "@/components/ui/icons";
import AccountDetailsSkeleton from './skeleton';
import { useTabBar } from '@/context/TabBarContext';

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
    const { showTabBar: setTabBarVisible } = useTabBar();
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
    const [includeInTotal, setIncludeInTotal] = useState(true);

    // Get account details
    const { data: accountData, isLoading: isLoadingAccount } = api.account.getById.useQuery(
        { accountId: id },
        { enabled: !!id }
    );

    // Get account balance
    const { data: balanceData, isLoading: isLoadingBalance } = api.account.listWithBalances.useQuery({});

    // Get last 3 transactions for this account
    const { data: transactionsData, isLoading: isLoadingTransactions } = api.transaction.list.useQuery(
        { accountId: id, limit: 3 },
        { enabled: !!id }
    );

    const utils = api.useUtils();

    // Update account mutation
    const { mutate: updateAccount, isLoading: isUpdating } = api.account.update.useMutation({
        onSuccess: async () => {
            await utils.account.listWithBalances.invalidate();
            await utils.account.getById.invalidate({ accountId: id });
            await utils.transaction.list.invalidate({ accountId: id });
            setIsSaving(false);
            router.back();
        },
        onError: (error) => {
            setError(error.message);
            setIsSaving(false);
        }
    });

    // Delete account mutation
    const { mutate: deleteAccount, isLoading: isDeleting } = api.account.delete.useMutation({
        onSuccess: async () => {
            await utils.account.listWithBalances.invalidate();
            setIsShowingDeleteConfirm(false);
            router.back();
        },
        onError: (error) => {
            setError(error.message);
            setIsShowingDeleteConfirm(false);
        }
    });

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
            setSavingTarget(accountData.targetAmount ? formatCurrency(Number(accountData.targetAmount)).integer + ',' + formatCurrency(Number(accountData.targetAmount)).decimal : '');
            setAccountColor(accountData.color || AccountColors[accountData.iconName as keyof typeof AccountColors] || '#409FF8');
            setAccountIcon(accountData.iconName as IconName || 'bank-card');
            setIncludeInTotal(true); // This could be a field in the account model
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
                targetAmount: isSavingsAccount ? parseFloat(savingTarget.replace(",", ".")) : null,
                color: accountColor,
                iconName: accountIcon,
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

    const { integer, decimal } = formatCurrency(balance);

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
        <HeaderContainer onBackPress={() => setTabBarVisible()} variant="secondary" customTitle={t("account.details.title", "MODIFICA CONTO")}>
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
                        {/* Account header with icon, name, and color - Following Figma design */}
                        <View className="px-4 py-6 mt-3 bg-white">
                            <View className="flex-row items-center justify-center gap-3 mb-3">
                                {/* Icon on left - Pressable for overlay */}
                                <Pressable
                                    className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center"
                                    onPress={() => setShowIconOverlay(true)}
                                >
                                    <SvgIcon name={accountIcon} width={24} height={24} color="#6B7280" />
                                </Pressable>

                                {/* Account name in center */}
                                <Pressable
                                    className="flex-1 px-4 bg-gray-100 h-16 items-start justify-center rounded-xl"
                                    onPress={() => router.push(`/(protected)/(accounts)/${id}/edit-name`)}
                                >
                                    <Text className="text-lg font-medium text-black text-left font-sans">
                                        {accountName}
                                    </Text>
                                </Pressable>

                                {/* Color circle on right - Pressable for overlay */}
                                <Pressable
                                    className="w-16 h-16 rounded-xl bg-gray-100 items-center justify-center"
                                    onPress={() => setShowColorOverlay(true)}
                                >
                                    <View className="w-6 h-6 rounded-full" style={{ backgroundColor: accountColor }} />
                                </Pressable>
                            </View>

                            {/* Balance section */}
                            <Pressable className="bg-gray-50 rounded-xl p-4" onPress={() => router.push(`/(protected)/(accounts)/${id}/edit-balance`)}>
                                <Text className="text-sm font-medium text-gray-500 mb-1">Bilancio</Text>
                                <View className="flex-row items-baseline gap-1">
                                    <Text className="text-base font-normal text-black">€</Text>
                                    <Text className="text-2xl font-medium text-black">{integer}</Text>
                                    <Text className="text-xl font-normal text-black">,{decimal}</Text>
                                </View>
                            </Pressable>
                        </View>

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


                        {/* Account Settings Form */}
                        <View className="mt-3">
                            {/* Section 1: Basic settings */}
                            <View className="bg-white  py-4 px-4">
                                {/* Include in total toggle */}
                                <View className="flex-row items-center justify-between py-4 border-b border-gray-100">
                                    <Text className="text-base font-semibold text-black">
                                        {t("account.details.include_in_total", "Includi nel patrimonio totale")}
                                    </Text>
                                    <Switch
                                        value={includeInTotal}
                                        onValueChange={setIncludeInTotal}
                                        trackColor={{ false: "#E5E7EB", true: "#005EFD" }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>

                                {/* Default Account Toggle */}
                                <View className="flex-row items-center justify-between py-4">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-base font-semibold text-black">
                                            {t("account.details.default_account", "Conto predefinito")}
                                        </Text>
                                        <Text className="text-sm text-gray-500">
                                            {t("account.details.default_account_desc", "Imposta questo conto come preselezionato quando crei una transazione")}
                                        </Text>
                                    </View>
                                    <Switch
                                        value={isDefaultAccount}
                                        onValueChange={setIsDefaultAccount}
                                        trackColor={{ false: "#E5E7EB", true: "#005EFD" }}
                                        thumbColor="#FFFFFF"
                                    />
                                </View>
                                <View className="bg-white rounded-lg mb-6">
                                    <View className="flex-row items-center justify-between py-4  border-gray-100">
                                        <View className="flex-1 mr-4">
                                            <Text className="text-base font-semibold text-black">
                                                {t("account.details.savings_account", "Conto di risparmio")}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                {t("account.details.savings_account_desc", "Abilita per aggiungere un obiettivo di risparmio")}
                                            </Text>
                                        </View>
                                        <Switch
                                            value={isSavingsAccount}
                                            onValueChange={setIsSavingsAccount}
                                            trackColor={{ false: "#E5E7EB", true: "#005EFD" }}
                                            thumbColor="#FFFFFF"
                                        />
                                    </View>

                                    {/* Saving Target Input - Only visible when savings is enabled */}
                                    <View className={cn("flex-row items-center justify-between py-4 px-4 bg-gray-100 rounded-xl",
                                        isSavingsAccount ? "opacity-100" : "opacity-20"
                                    )}>
                                        <Text className="text-base font-semibold text-gray-500">
                                            {t("account.details.saving_target", "Obiettivo di risparmio")}
                                        </Text>
                                        <View className="flex-row items-start justify-start gap-2">
                                            <Text className={cn("text-base font-sans font-semibold text-black leading-tight",
                                                savingTarget != "" ? "opacity-100" : "opacity-0"
                                            )}>€</Text>
                                            <TextInput
                                                value={savingTarget}
                                                editable={isSavingsAccount}
                                                onChangeText={setSavingTarget}
                                                keyboardType="numeric"
                                                className="text-base font-sans font-semibold text-black leading-tight"
                                                textAlign="right"
                                                style={{ minWidth: 80 }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </View>

                        </View>


                        {/* Recent Transactions Section */}
                        {!isLoadingTransactions && transactionsData && (
                            <View className="mt-3 bg-white px-4 py-4">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-lg font-semibold text-black">
                                        {t("account.details.recent_transactions", "Ultime transazioni")}
                                    </Text>
                                    {transactionsData.items.length > 0 && (
                                        <Pressable
                                            className="py-1 px-2"
                                            onPress={() => {
                                                console.log(`/(protected)/(accounts)/${id}/transactions`);
                                                router.push(`/(protected)/(accounts)/${id}/transactions`);
                                            }}
                                        >
                                            <Text className="text-sm font-medium" style={{ color: accountColor }}>
                                                {t("account.details.view_all", "Vedi tutte")}
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>

                                {/* Transaction List or Empty State */}
                                {transactionsData.items.length > 0 ? (
                                    <View className="space-y-3">
                                        {transactionsData.items.map((transaction) => {
                                            const amount = Number(transaction.amount);
                                            const isNegative = amount < 0;
                                            const { integer, decimal } = formatCurrency(Math.abs(amount));
                                            const transactionDate = new Date(transaction.date);

                                            return (
                                                <View key={transaction.id} className="flex-row items-center py-3 border-b border-gray-100 last:border-b-0">
                                                    {/* Transaction Icon */}
                                                    <View className="w-10 h-10 rounded-lg bg-gray-100 items-center justify-center mr-3">
                                                        <Text className="text-sm font-medium text-black">
                                                            {transaction.subCategory?.icon ? transaction.subCategory?.icon : "🔧"}
                                                        </Text>
                                                    </View>

                                                    {/* Transaction Details */}
                                                    <View className="flex-1 mr-3">
                                                        <Text className="text-base font-medium text-black mb-1">
                                                            {transaction.description}
                                                        </Text>
                                                        <Text className="text-sm text-gray-500">
                                                            {transactionDate.toLocaleDateString('it-IT', {
                                                                day: '2-digit',
                                                                month: '2-digit',
                                                                year: 'numeric'
                                                            })}
                                                            {transaction.subCategory && (
                                                                <Text> • {transaction.subCategory.name}</Text>
                                                            )}
                                                        </Text>
                                                    </View>

                                                    {/* Transaction Amount */}
                                                    <View className="items-end">
                                                        <View className="flex-row items-baseline">
                                                            <Text className={`text-sm font-normal ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                                                                {isNegative ? '-' : '+'}€
                                                            </Text>
                                                            <Text className={`text-lg font-medium ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                                                                {integer}
                                                            </Text>
                                                            <Text className={`text-base font-normal ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                                                                ,{decimal}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            );
                                        })}
                                    </View>
                                ) : (
                                    <View className="py-8 items-center">
                                        <SvgIcon name="box" width={32} height={32} color="#D1D5DB" />
                                        <Text className="text-sm text-gray-400 mt-2 text-center">
                                            {t("account.details.no_transactions", "Nessuna transazione ancora")}
                                        </Text>
                                        <Text className="text-xs text-gray-400 mt-1 text-center">
                                            {t("account.details.no_transactions_desc", "Le tue transazioni appariranno qui")}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}


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