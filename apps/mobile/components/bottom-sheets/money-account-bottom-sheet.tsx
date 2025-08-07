import React, { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import BottomSheet, { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
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

// Mock data for placeholder accounts
const MOCK_ACCOUNTS: AccountWithBalance[] = [
  {
    account: {
      id: '1',
      name: 'Main Account',
      iconName: 'card',
      color: '#3B82F6',
    },
    balance: 2450.75,
  },
  {
    account: {
      id: '2', 
      name: 'Savings',
      iconName: 'pig-money',
      color: '#10B981',
    },
    balance: 8920.50,
  },
  {
    account: {
      id: '3',
      name: 'Business',
      iconName: 'briefcase',
      color: '#F59E0B',
    },
    balance: 3240.25,
  },
  {
    account: {
      id: '4',
      name: 'Emergency Fund',
      iconName: 'shield',
      color: '#EF4444',
    },
    balance: 5000.00,
  },
];

// Account Card Component
const AccountCard: React.FC<{
  account: AccountWithBalance;
  isSelected: boolean;
  onPress: () => void;
  isLast: boolean;
}> = React.memo(({ account, isSelected, onPress, isLast }) => {
  const formatCurrency = (amount: number) => {
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const [integer, decimal] = formatted.split('.');
    return { integer, decimal };
  };

  const { integer, decimal } = formatCurrency(account.balance);

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
            <Text className="text-white text-sm font-normal">$</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-lg font-medium" style={{ fontFamily: 'Apfel Grotezk' }}>
                {integer}
              </Text>
              <Text className="text-white text-sm font-normal" style={{ fontFamily: 'Apfel Grotezk' }}>
                .{decimal}
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
  accountToFilter = [],
  renderBackdrop,
  handleClosePress,
  selectedAccountId,
  setSelectedAccountId,
}) => {
  // Filter accounts based on accountToFilter prop
  const filteredAccounts = useMemo(() => {
    return MOCK_ACCOUNTS.filter(account => !accountToFilter.includes(account.account.id));
  }, [accountToFilter]);

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    handleClosePress();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      onClose={handleClosePress}
    >
      <View className="flex-1 px-4 pb-4">
        <Text className="text-lg font-semibold text-gray-900 mb-4 text-center">
          Select Account
        </Text>
        
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="space-y-3">
            {filteredAccounts.map((account, index) => (
              <AccountCard
                key={account.account.id}
                account={account}
                isSelected={selectedAccountId === account.account.id}
                isLast={index === filteredAccounts.length - 1}
                onPress={() => handleAccountSelect(account.account.id)}
              />
            ))}
          </View>
          
          {filteredAccounts.length === 0 && (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-gray-500 text-center">
                No accounts available
              </Text>
            </View>
          )}
        </ScrollView>
        
        <View className="mt-4 p-3 bg-gray-50 rounded-xl">
          <Text className="text-gray-500 text-xs text-center">
            This is a template with placeholder data
          </Text>
        </View>
      </View>
    </BottomSheet>
  );
};