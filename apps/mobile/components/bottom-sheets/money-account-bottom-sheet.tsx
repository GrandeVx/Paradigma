import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { IconName } from '../ui/icons';
import { useCurrency } from '@/hooks/use-currency';

interface MoneyAccountBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  accountToFilter?: string[];
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactNode;
  handleClosePress: () => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (accountId: string | null) => void;
}

// Interface for account data structure
interface AccountWithBalance {
  account: {
    id: string;
    name: string;
    iconName: string | null;
    color: string | null;
  };
  balance: number;
}

// Account Card Component similar to index.tsx
const AccountCard: React.FC<{
  account: AccountWithBalance;
  isSelected: boolean;
  onPress: () => void;
  formatDisplayCurrency: (amount: number) => { integer: string; decimal: string };
  getCurrencySymbol: () => string;
  isLast: boolean;
}> = React.memo(({ account, isSelected, onPress, formatDisplayCurrency, getCurrencySymbol, isLast }) => {
  const { integer, decimal } = formatDisplayCurrency(account.balance);
  const currencySymbol = getCurrencySymbol();

  return (
    <Pressable
      className={`w-full bg-transparent ${isLast ? '' : 'mb-[-15px]'}`}
      onPress={onPress}
    >
      <View className={`w-full p-4 ${isLast ? 'rounded-3xl' : 'rounded-t-3xl'} ${isSelected ? 'opacity-80' : 'opacity-100'}`} style={{ backgroundColor: account.account.color || '#CCCCCC' }}>
        <View className={cn(
          "flex-row justify-between items-center",
          isLast ? 'py-4 px-4' : 'p-4 pb-8'
        )}>
          <View className="flex-row items-center gap-3">
            <SvgIcon
              name={account.account.iconName as IconName || 'card'}
              width={24}
              height={24}
              color="#FFFFFF"
            />
            <Text className="text-white font-semibold text-base">{account.account.name}</Text>
          </View>

          <View className="flex-row items-baseline gap-1">
            <Text className="text-white text-sm font-normal">{currencySymbol}</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Apfel Grotezk' }}>
                {integer}
              </Text>
              <Text className="text-white text-sm font-normal" style={{ fontFamily: 'Apfel Grotezk' }}>
                ,{decimal}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
});

export const MoneyAccountBottomSheet: React.FC<MoneyAccountBottomSheetProps> = ({
  bottomSheetRef,
  snapPoints,
  accountToFilter,
  renderBackdrop,
  handleClosePress,
  selectedAccountId,
  setSelectedAccountId,
}) => {
  const { data: moneyAccounts, isLoading: isMoneyAccountsLoading } = api.account.listWithBalances.useQuery({});
  const { getCurrencySymbol } = useCurrency();

  const filteredMoneyAccounts = useMemo(() => {
    if (accountToFilter) {
      return moneyAccounts?.filter((account) => !accountToFilter.includes(account.account.id));
    }
    return moneyAccounts;
  }, [moneyAccounts, accountToFilter]);

  // Custom formatter for the display format used in the accounts screen
  const formatDisplayCurrency = (amount: number) => {
    const [integer, decimal] = amount.toFixed(2).split('.');
    // Format with dot as thousand separator and comma as decimal separator (Italian format)
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return {
      integer: formattedInteger,
      decimal: decimal
    };
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // Start closed
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleStyle={{
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#000",
        width: 40,
      }}
      containerStyle={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF"
      }}
    >
      <View className="w-full h-full pt-4 px-4">
        <View className="flex flex-row justify-between items-center border-b border-gray-300 mb-5 pb-4">
          <Text className="text-2xl font-normal">Seleziona Conto</Text>
          <Pressable onPress={handleClosePress}>
            <SvgIcon name="close" size={24} color="black" />
          </Pressable>
        </View>

        <View className="mb-4">
          {isMoneyAccountsLoading ? (
            <View className="flex items-center justify-center h-40">
              <Text>Caricamento conti...</Text>
            </View>
          ) : (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
            >
              {filteredMoneyAccounts?.map((item, index) => (
                <AccountCard
                  key={item.account.id}
                  account={item}
                  isSelected={selectedAccountId === item.account.id}
                  onPress={() => {
                    if (selectedAccountId === item.account.id) {
                      setSelectedAccountId(null);
                    } else {
                      setSelectedAccountId(item.account.id);
                    }
                    handleClosePress();
                  }}
                  formatDisplayCurrency={formatDisplayCurrency}
                  getCurrencySymbol={getCurrencySymbol}
                  isLast={index === filteredMoneyAccounts.length - 1}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}; 