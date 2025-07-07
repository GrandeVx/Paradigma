import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import CategoryTransactionsView from '@/components/category-transactions/CategoryTransactionsView';

export default function BudgetCategoryTransactionsScreen() {
  const params = useLocalSearchParams<{ categoryId: string }>();
  const categoryId = params.categoryId;

  if (!categoryId) {
    return null;
  }

  return <CategoryTransactionsView categoryId={categoryId} context="budgets" />;
}