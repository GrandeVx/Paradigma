import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { IconName } from '../ui/icons';

interface MoneyAccountBottomSheetProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  snapPoints: string[];
  accountToFilter?: string[];
  renderBackdrop: (props: BottomSheetBackdropProps) => React.ReactNode;
  handleClosePress: () => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (accountId: string | null) => void;
}

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

  const filteredMoneyAccounts = useMemo(() => {
    if (accountToFilter) {
      return moneyAccounts?.filter((account) => !accountToFilter.includes(account.account.id));
    }
    return moneyAccounts;
  }, [moneyAccounts, accountToFilter]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1} // Start closed
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleStyle={{
        backgroundColor: '#FFFFFF', // Consider using theme variables from tailwind.config.js
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
      }}
      handleIndicatorStyle={{
        backgroundColor: "#000", // Consider using theme variables
        width: 40,
      }}
      containerStyle={{
        zIndex: 1000,
      }}
      backgroundStyle={{
        backgroundColor: "#FFFFFF" // Consider using theme variables
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
                gap: 12,
                paddingBottom: 20,
              }}
            >
              {filteredMoneyAccounts?.map((item) => (
                <Pressable
                  key={item.account.id}
                  onPress={() => {
                    if (selectedAccountId === item.account.id) {
                      setSelectedAccountId(null);
                    } else {
                      setSelectedAccountId(item.account.id);
                    }
                    handleClosePress();
                  }}
                  className={cn(
                    "flex flex-row items-center justify-between p-4 rounded-lg border border-gray-200",
                    selectedAccountId === item.account.id ? "bg-gray-100" : ""
                  )}
                >
                  <View className="flex flex-row items-center gap-3">
                    <View
                      style={{ backgroundColor: item.account.color || '#CCCCCC' }}
                      className="w-10 h-10 rounded-full items-center justify-center"
                    >
                      <SvgIcon name={item.account.iconName as IconName} size={24} color="white" />
                    </View>
                    <View>
                      <Text className="text-black text-lg font-medium">{item.account.name}</Text>
                    </View>
                  </View>
                  <Text className="text-black text-lg font-medium">
                    €{item.balance.toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}; 