import React from 'react';
import { StyleSheet, ScrollView, Pressable, View, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import HeaderContainer from '@/components/layouts/_header';
import { api } from '@/lib/api';
import { Decimal } from 'decimal.js';
import { useTranslation } from 'react-i18next';


// Types based on API response
interface SubCategory {
  id: string;
  name: string;
  icon: string;
  macroCategory: {
    id: string;
    name: string;
    type: string;
    color: string;
    icon: string;
  };
}

interface MoneyAccount {
  id: string;
  name: string;
  iconName?: string | null;
  color?: string | null;
  default: boolean;
}

interface RecurringTransaction {
  id: string;
  description: string;
  amount: Decimal;
  type: 'INCOME' | 'EXPENSE';
  frequencyType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  frequencyInterval: number;
  isActive: boolean;
  isInstallment: boolean;
  subCategory?: SubCategory | null;
  moneyAccount?: MoneyAccount | null;
  notes?: string | null;
  startDate: Date;
  nextDueDate: Date;
  endDate?: Date | null;
}

// Format currency helper (Italian format)
const formatCurrency = (amount: number | Decimal) => {
  const numAmount = typeof amount === 'number' ? amount : Number(amount);
  const [integer, decimal] = numAmount.toFixed(2).split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedInteger},${decimal}`;
};

// Get frequency text
const getFrequencyText = (frequencyType: string, frequencyInterval: number) => {
  const interval = frequencyInterval || 1;

  switch (frequencyType) {
    case 'DAILY':
      return interval === 1 ? 'Ogni giorno' : `Ogni ${interval} giorni`;
    case 'WEEKLY':
      return interval === 1 ? 'Ogni settimana' : `Ogni ${interval} settimane`;
    case 'MONTHLY':
      return interval === 1 ? 'Ogni mese' : `Ogni ${interval} mesi`;
    case 'YEARLY':
      return interval === 1 ? 'Ogni anno' : `Ogni ${interval} anni`;
    default:
      return 'Frequenza sconosciuta';
  }
};

// Get category display with emoji
const getCategoryDisplay = (subCategory?: SubCategory | null) => {
  if (!subCategory) return '❓ Altro';
  return `${subCategory.icon} ${subCategory.name}`;
};

// Recurring Transaction Card Component
const RecurringCard: React.FC<{
  recurring: RecurringTransaction;
  onEdit: (id: string) => void;
}> = ({ recurring, onEdit }) => {
  const isIncome = recurring.type === 'INCOME';
  const formattedAmount = formatCurrency(Math.abs(Number(recurring.amount)));
  const frequencyText = getFrequencyText(recurring.frequencyType, recurring.frequencyInterval);
  const categoryText = getCategoryDisplay(recurring.subCategory);
  const accountName = recurring.moneyAccount?.name || 'Conto non specificato';

  return (
    <View style={styles.card}>
      {/* Header with title and edit button */}
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{recurring.description}</Text>
        <Pressable
          style={styles.editButton}
          onPress={() => onEdit(recurring.id)}
        >
          <SvgIcon name="edit" width={20} height={20} color="#005EFD" />
        </Pressable>
      </View>

      {/* First row: Amount and Frequency */}
      <View style={styles.cardRow}>
        <View style={[styles.tag, styles.amountTag]}>
          <Text style={[styles.tagText, { color: isIncome ? '#66BD50' : '#DE4841' }]}>
            € {formattedAmount}
          </Text>
        </View>
        <View style={[styles.tag, styles.frequencyTag]}>
          <Text style={styles.tagText}>{frequencyText}</Text>
        </View>
      </View>

      {/* Second row: Account and Category */}
      <View style={styles.cardRow}>
        <View style={[styles.tag, styles.accountTag]}>
          <Text style={styles.accountText}>{accountName.length > 20 ? accountName.slice(0, 10) + '...' : accountName}</Text>
        </View>
        <View style={[styles.tag, styles.categoryTag]}>
          <Text style={styles.tagText}>{categoryText}</Text>
        </View>
      </View>

      {/* Status indicator for inactive rules */}
      {!recurring.isActive && (
        <View style={styles.inactiveIndicator}>
          <Text style={styles.inactiveText}>⏸️ Sospesa</Text>
        </View>
      )}
    </View>
  );
};

export default function RecurringTransactionsScreen() {
  const { t } = useTranslation();

  // Fetch recurring transactions (only non-installment ones = classic recurring)
  const { data: recurringData, isLoading, refetch } = api.recurringRule.list.useQuery({
    isInstallment: false, // Only classic recurring transactions, not installments
  });

  const handleEdit = (id: string) => {
    // Navigate to edit page (to be implemented)
    console.log('Edit recurring transaction:', id);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <HeaderContainer variant="secondary" customTitle={t('recurring.title')} tabBarHidden={true}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
          />
        }
        contentContainerStyle={{
          backgroundColor: '#F9FAFB',
          height: '100%',
        }}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento ricorrenze...</Text>
          </View>
        ) : recurringData && recurringData.length > 0 ? (
          recurringData.map((recurring) => (
            <RecurringCard
              key={recurring.id}
              recurring={recurring as RecurringTransaction}
              onEdit={handleEdit}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nessuna transazione ricorrente trovata</Text>
            <Text style={styles.emptySubtext}>
              Le tue ricorrenze appariranno qui quando ne creerai una
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </HeaderContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000',
    flex: 1,
    fontFamily: 'DM Sans',
    letterSpacing: -0.48,
  },
  editButton: {
    padding: 8,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  amountTag: {
    backgroundColor: '#F9FAFB',
  },
  frequencyTag: {
    backgroundColor: '#F9FAFB',
  },
  accountTag: {
    backgroundColor: '#F5FAFF',
  },
  categoryTag: {
    backgroundColor: '#F5FFFB',
  },
  tagText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000',
    fontFamily: 'DM Sans',
    letterSpacing: -0.16,
  },
  accountText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#409FF8',
    fontFamily: 'DM Sans',
    letterSpacing: -0.16,
  },
  inactiveIndicator: {
    alignItems: 'center',
    marginTop: 4,
  },
  inactiveText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 100,
  },
}); 