import React from 'react';
import { StyleSheet, ScrollView, Pressable, View, RefreshControl } from 'react-native';
import { Text } from '@/components/ui/text';
import { SvgIcon } from '@/components/ui/svg-icon';
import HeaderContainer from '@/components/layouts/_header';
import { api } from '@/lib/api';
import { Decimal } from 'decimal.js';


// Types based on actual API response
type InstallmentTransaction = {
  id: string;
  description: string;
  amount: number | string | Decimal;
  type: 'INCOME' | 'EXPENSE';
  frequencyType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  frequencyInterval: number;
  subCategory: {
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
  } | null;
  moneyAccount: {
    id: string;
    name: string;
    iconName?: string | null;
    color?: string | null;
    default: boolean;
  } | null;
  isActive: boolean;
  nextDueDate?: Date | string | null; // From database field
  totalOccurrences?: number | null; // From database field
  occurrencesGenerated?: number | null; // From database field
  isInstallment: boolean;
}

// Format currency helper (Italian format)
const formatCurrency = (amount: number | string | Decimal) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) :
    amount instanceof Decimal ? amount.toNumber() : amount;
  const [integer, decimal] = numAmount.toFixed(2).split('.');
  const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `€ ${formattedInteger},${decimal}`;
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
      return `Ogni ${interval} ${frequencyType.toLowerCase()}`;
  }
};

// Get days until next execution
const getDaysUntilNext = (nextDate?: Date | string) => {
  if (!nextDate) return null;

  const next = new Date(nextDate);
  const now = new Date();
  const diffTime = next.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'oggi';
  if (diffDays === 1) return 'in 1 giorno';
  if (diffDays > 1) return `in ${diffDays} giorni`;
  return null;
};

// Calculate future installment dates based on frequency
const calculateFutureDates = (
  startDate: Date | string,
  frequencyType: string,
  frequencyInterval: number,
  totalOccurrences: number,
  currentOccurrence: number
): Date[] => {
  const dates: Date[] = [];
  const baseDate = new Date(startDate);

  // Generate dates for remaining occurrences
  for (let i = currentOccurrence; i < totalOccurrences; i++) {
    const futureDate = new Date(baseDate);

    switch (frequencyType) {
      case 'DAILY':
        futureDate.setDate(baseDate.getDate() + (i * frequencyInterval));
        break;
      case 'WEEKLY':
        futureDate.setDate(baseDate.getDate() + (i * frequencyInterval * 7));
        break;
      case 'MONTHLY':
        futureDate.setMonth(baseDate.getMonth() + (i * frequencyInterval));
        break;
      case 'YEARLY':
        futureDate.setFullYear(baseDate.getFullYear() + (i * frequencyInterval));
        break;
    }

    dates.push(futureDate);
  }

  return dates;
};

// Format date for progress components (Italian format)
const formatProgressDate = (date: Date) => {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short'
  };

  return date.toLocaleDateString('it-IT', options);
};

// Safe format date for progress components (handles null/undefined)
const formatProgressDateSafe = (nextDate?: Date | string | null) => {
  if (!nextDate) return 'N/A';

  const date = new Date(nextDate);
  return formatProgressDate(date);
};

// Progress visualization components
const CheckIconsGrid = ({
  current,
  total,
  nextDueDate,
  frequencyType,
  frequencyInterval
}: {
  current: number;
  total: number;
  nextDueDate?: Date | string | null;
  frequencyType: string;
  frequencyInterval: number;
}) => {
  // Calculate future dates if we have nextDueDate
  const futureDates = nextDueDate
    ? calculateFutureDates(nextDueDate, frequencyType, frequencyInterval, total, current)
    : [];

  const items = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <View style={styles.progressContainer}>
      <View style={styles.checkGrid}>
        {items.map((item, index) => {
          const isPaid = index < current;
          const isFuture = index >= current;
          const futureDateIndex = index - current;

          if (isPaid) {
            // Green check icon for paid installments
            return (
              <View
                key={index}
                style={[styles.checkIcon, { backgroundColor: '#66BD50' }]}
              >
                <SvgIcon
                  name="checks"
                  size={14}
                  color="#FFFFFF"
                />
              </View>
            );
          } else if (isFuture && futureDateIndex < futureDates.length) {
            // Gray frame with specific date for future installments
            return (
              <View
                key={index}
                style={styles.dateFrame}
              >
                <Text style={styles.dateText}>
                  {formatProgressDate(futureDates[futureDateIndex])}
                </Text>
              </View>
            );
          } else {
            // Fallback gray frame
            return (
              <View
                key={index}
                style={styles.dateFrame}
              >
                <Text style={styles.dateText}>N/A</Text>
              </View>
            );
          }
        })}
      </View>
      {/* No progress info section for ≤5 installments */}
    </View>
  );
};

const DotsGrid = ({ current, total, nextDueDate }: { current: number; total: number; nextDueDate?: Date | string | null }) => {
  const items = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <View style={styles.progressContainer}>
      <View className='flex-row items-center justify-between w-full '>
        <View style={styles.dotsGrid}>
          {items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: index < current ? '#66BD50' : '#E5E7EB' }
              ]}
            />
          ))}
        </View>
        <View className='flex-row gap-4 max-w-[100px]'>
          <View style={styles.progressItem}>
            <SvgIcon name="checks" size={16} color="#66BD50" />
            <Text style={styles.progressText}>{current}/{total}</Text>
          </View>
          <View style={styles.progressItem}>
            <SvgIcon name="calendar" size={16} color="#6B7280" />
            <Text style={styles.progressText}>{formatProgressDateSafe(nextDueDate)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const ProgressBar = ({ current, total, nextDueDate }: { current: number; total: number; nextDueDate?: Date | string | null }) => {
  const percentage = Math.round((current / total) * 100);
  const progressWidth = (current / total) * 188; // 188px total width

  return (
    <View className='flex-row items-center justify-between w-full'>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground} />
        <View style={[styles.progressBarFill, { width: progressWidth }]} />
        {
          percentage > 20 && (
            <Text style={styles.progressPercentageMoreThan20}>{percentage}%</Text>
          ) || (
            <Text style={styles.progressPercentageLessThan20}>{percentage}%</Text>
          )
        }
      </View>
      <View className='flex-row gap-4 max-w-[100px]'>
        <View style={styles.progressItem}>
          <SvgIcon name="checks" size={16} color="#66BD50" />
          <Text style={styles.progressText}>{current}/{total}</Text>
        </View>
        <View style={styles.progressItem}>
          <SvgIcon name="calendar" size={16} color="#6B7280" />
          <Text style={styles.progressText}>{formatProgressDateSafe(nextDueDate)}</Text>
        </View>
      </View>
    </View>
  );
};

// Main component
export default function InstallmentsScreen() {
  // Fetch installment transactions
  const { data: installmentData, isLoading, refetch } = api.recurringRule.list.useQuery({
    isInstallment: true, // Only installments
  });

  const handleEdit = (id: string) => {
    // Navigate to edit page (to be implemented)
    console.log('Edit installment:', id);
  };

  const handleRefresh = () => {
    refetch();
  };

  // Render installment card based on remaining installments
  const renderInstallmentCard = (installment: InstallmentTransaction) => {
    const current = installment.occurrencesGenerated || 0;
    const total = installment.totalOccurrences || 0;
    const totalAmount = typeof installment.amount === 'string' ? parseFloat(installment.amount) :
      installment.amount instanceof Decimal ? installment.amount.toNumber() : installment.amount;
    // Calculate installment amount by dividing total amount by number of occurrences
    const installmentAmountNum = total > 0 ? totalAmount / total : totalAmount;

    const isUpcoming = getDaysUntilNext(installment.nextDueDate || undefined);
    const accountName = installment.moneyAccount?.name || 'Account';
    const categoryName = installment.subCategory ?
      `${installment.subCategory.icon} ${installment.subCategory.name}` :
      'Categoria';

    // Determine which progress type to show based on total occurrences (not remaining)
    let progressComponent;
    if (total <= 5) {
      progressComponent = <CheckIconsGrid current={current} total={total} nextDueDate={installment.nextDueDate} frequencyType={installment.frequencyType} frequencyInterval={installment.frequencyInterval} />;
    } else if (total <= 24) {
      progressComponent = <DotsGrid current={current} total={total} nextDueDate={installment.nextDueDate} />;
    } else {
      progressComponent = <ProgressBar current={current} total={total} nextDueDate={installment.nextDueDate} />;
    }

    return (
      <Pressable
        key={installment.id}
        style={styles.installmentCard}
        onPress={() => handleEdit(installment.id)}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.installmentTitle}>{installment.description}</Text>
            {isUpcoming && (
              <Text style={styles.upcomingText}>{isUpcoming}</Text>
            )}
          </View>
          <Pressable style={styles.editButton} onPress={() => handleEdit(installment.id)}>
            <SvgIcon name="edit" size={24} color="#005EFD" />
          </Pressable>
        </View>

        {/* Progress visualization */}
        <View style={styles.progressSection}>
          {progressComponent}
        </View>

        {/* Amount and frequency */}
        <View style={styles.amountRow}>
          <View style={styles.amountCard}>
            <Text style={styles.totalAmount}>{formatCurrency(totalAmount)}</Text>
            <Text style={styles.installmentAmount}>{formatCurrency(installmentAmountNum)}</Text>
          </View>
          <View style={styles.frequencyCard}>
            <Text style={styles.frequencyText}>{getFrequencyText(installment.frequencyType, installment.frequencyInterval)}</Text>
          </View>
        </View>

        {/* Account and category */}
        <View style={styles.cardRow}>
          <View style={[styles.tag, styles.accountTag]}>
            <Text style={styles.accountText}>{accountName.length > 15 ? accountName.slice(0, 12) + '...' : accountName}</Text>
          </View>
          <View style={[styles.tag, styles.categoryTag]}>
            <Text style={styles.categoryText}>{categoryName}</Text>
          </View>
        </View>

        {!installment.isActive && (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>⏸️ Sospesa</Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <HeaderContainer variant="secondary" customTitle="RATE" tabBarHidden={true}>
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
          paddingBottom: 100,
        }}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Caricamento rate...</Text>
          </View>
        ) : installmentData && installmentData.length > 0 ? (
          <View style={styles.installmentsList}>
            {installmentData.map(renderInstallmentCard)}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Nessuna rata trovata</Text>
            <Text style={styles.emptyDescription}>
              Non hai ancora nessuna rata configurata.
            </Text>
          </View>
        )}
      </ScrollView>
    </HeaderContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  installmentsList: {
    gap: 16,
    padding: 16,
  },
  installmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    gap: 8,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  installmentTitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#000000',
    letterSpacing: -0.48,
    fontFamily: 'DM Sans',
  },
  upcomingText: {
    fontSize: 24,
    fontWeight: '400',
    color: '#6B7280',
    letterSpacing: -0.48,
    fontFamily: 'DM Sans',
  },
  editButton: {
    padding: 8,
  },
  progressSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 8,
    width: 'auto',
  },
  progressContainer: {
    gap: 8,
    width: '100%',
  },
  checkGrid: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
  },
  checkIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  dotsContainer: {
    gap: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 12,
    borderRadius: 4,
  },
  progressBarContainer: {
    position: 'relative',
    width: 188,
    height: 12,
  },
  progressBarBackground: {
    position: 'absolute',
    width: 188,
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
  },
  progressBarFill: {
    position: 'absolute',
    height: 12,
    backgroundColor: '#66BD50',
    borderRadius: 6,
  },
  progressPercentageMoreThan20: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 24,
    height: 12,
    fontSize: 11,
    fontWeight: '400',
    color: '#FFFFFF',
    textAlign: 'right',
    fontFamily: 'Apfel Grotezk',
    lineHeight: 12,
  },
  progressPercentageLessThan20: {
    position: 'absolute',
    right: 10,
    top: 0,
    width: 24,
    height: 12,
    fontSize: 11,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'right',
    fontFamily: 'Apfel Grotezk',
    lineHeight: 12,
  },
  progressInfo: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 8,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Apfel Grotezk',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 8,
  },
  amountCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Apfel Grotezk',
  },
  installmentAmount: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Apfel Grotezk',
  },
  frequencyCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    height: 'auto',
    justifyContent: 'center',
    alignItems: 'center',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'DM Sans',
    lineHeight: 24,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountTag: {
    backgroundColor: '#F5FAFF',
  },
  accountText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#409FF8',
    fontFamily: 'DM Sans',
    letterSpacing: -0.16,
  },
  categoryTag: {
    backgroundColor: '#F5FFFB',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'DM Sans',
    letterSpacing: -0.16,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  dateFrame: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '400',
    color: '#6B7280',
    fontFamily: 'Apfel Grotezk',
    textAlign: 'center',
  },
}); 