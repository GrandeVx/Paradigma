import React from "react";
import { useLocalSearchParams } from "expo-router";
import TransactionEditForm from "@/components/transaction-edit/TransactionEditForm";

export default function BudgetTransactionEditScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const transactionId = params.id;

  if (!transactionId) {
    return null;
  }

  return <TransactionEditForm transactionId={transactionId} />;
}