import React from 'react';
import { View, ScrollView } from 'react-native';
import { Skeleton } from '@/components/ui/skeleton';
import HeaderContainer from '@/components/layouts/_header';
import { useTranslation } from 'react-i18next';

export default function AccountDetailsSkeleton() {
  const { t } = useTranslation();

  return (
    <HeaderContainer variant="secondary" customTitle={t("account.details.title", "MODIFICA CONTO")}>
      <View className="flex-1 bg-white">
        <ScrollView
          className="flex-1 bg-gray-100"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Account header skeleton */}
          <View className="px-4 py-6 mt-3 bg-white">
            <View className="flex-row items-center justify-center gap-3 mb-3">
              {/* Icon skeleton */}
              <Skeleton width={64} height={64} borderRadius={12} />

              {/* Name skeleton */}
              <View className="flex-1 px-4 bg-gray-100 h-16 items-start justify-center rounded-xl">
                <Skeleton width="70%" height={24} />
              </View>

              {/* Color skeleton */}
              <Skeleton width={64} height={64} borderRadius={12} />
            </View>

            {/* Balance section skeleton */}
            <View className="bg-gray-50 rounded-xl p-4">
              <Skeleton width={60} height={16} style={{ marginBottom: 8 }} />
              <View className="flex-row items-baseline gap-1">
                <Skeleton width={20} height={20} />
                <Skeleton width={80} height={32} />
                <Skeleton width={40} height={24} />
              </View>
            </View>
          </View>

          {/* Settings form skeleton */}
          <View className="mt-3 bg-white py-4 px-4">
            {/* Toggle items skeleton */}
            {[1, 2, 3].map((item) => (
              <View key={item} className="flex-row items-center justify-between py-4 border-b border-gray-100">
                <View className="flex-1 mr-4">
                  <Skeleton width="60%" height={18} style={{ marginBottom: 4 }} />
                  <Skeleton width="80%" height={14} />
                </View>
                <Skeleton width={48} height={28} borderRadius={14} />
              </View>
            ))}

            {/* Savings target skeleton */}
            <View className="flex-row items-center justify-between py-4 px-4 bg-gray-100 rounded-xl mt-4">
              <Skeleton width="50%" height={18} />
              <View className="flex-row items-center gap-2">
                <Skeleton width={16} height={18} />
                <Skeleton width={60} height={18} />
              </View>
            </View>
          </View>

          {/* Recent transactions skeleton */}
          <View className="mt-3 bg-white px-4 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <Skeleton width="40%" height={20} />
              <Skeleton width="20%" height={16} />
            </View>

            {/* Transaction items skeleton */}
            {[1, 2, 3].map((item) => (
              <View key={item} className="flex-row items-center py-3 border-b border-gray-100">
                {/* Transaction icon skeleton */}
                <Skeleton width={40} height={40} borderRadius={8} style={{ marginRight: 12 }} />

                {/* Transaction details skeleton */}
                <View className="flex-1 mr-3">
                  <Skeleton width="70%" height={16} style={{ marginBottom: 4 }} />
                  <Skeleton width="50%" height={14} />
                </View>

                {/* Transaction amount skeleton */}
                <View className="items-end">
                  <View className="flex-row items-baseline">
                    <Skeleton width={20} height={14} style={{ marginRight: 2 }} />
                    <Skeleton width={40} height={18} style={{ marginRight: 2 }} />
                    <Skeleton width={20} height={16} />
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Delete button skeleton */}
          <View className="px-4 bg-white mt-3 py-6">
            <Skeleton width="100%" height={48} borderRadius={8} />
          </View>
        </ScrollView>

        {/* Fixed save button skeleton */}
        <View className="absolute bottom-0 left-0 right-0 px-4 py-4 mb-2 bg-white border-t border-gray-200">
          <Skeleton width="100%" height={48} borderRadius={8} />
        </View>
      </View>
    </HeaderContainer>
  );
} 