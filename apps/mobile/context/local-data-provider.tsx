import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  initDatabase,
  getTransactions,
  getAccounts,
  getCategories,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  addAccount,
  updateAccount,
  deleteAccount,
  addCategory,
  updateCategory,
  deleteCategory,
  Transaction,
  Account,
  Category,
} from '@/lib/localDatabase';

interface LocalDataContextProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  refresh: () => Promise<void>;
  addTransaction: (tx: Transaction) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addAccount: (acc: Account) => Promise<void>;
  updateAccount: (acc: Account) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  addCategory: (cat: Category) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const LocalDataContext = createContext<LocalDataContextProps>({} as LocalDataContextProps);

export const useLocalData = () => useContext(LocalDataContext);

export const LocalDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const load = async () => {
    await initDatabase();
    const [txs, accs, cats] = await Promise.all([
      getTransactions(),
      getAccounts(),
      getCategories(),
    ]);
    setTransactions(txs);
    setAccounts(accs);
    setCategories(cats);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddTransaction = async (tx: Transaction) => {
    await addTransaction(tx);
    setTransactions(await getTransactions());
  };

  const handleUpdateTransaction = async (tx: Transaction) => {
    await updateTransaction(tx);
    setTransactions(await getTransactions());
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteTransaction(id);
    setTransactions(await getTransactions());
  };

  const handleAddAccount = async (acc: Account) => {
    await addAccount(acc);
    setAccounts(await getAccounts());
  };

  const handleUpdateAccount = async (acc: Account) => {
    await updateAccount(acc);
    setAccounts(await getAccounts());
  };

  const handleDeleteAccount = async (id: string) => {
    await deleteAccount(id);
    setAccounts(await getAccounts());
  };

  const handleAddCategory = async (cat: Category) => {
    await addCategory(cat);
    setCategories(await getCategories());
  };

  const handleUpdateCategory = async (cat: Category) => {
    await updateCategory(cat);
    setCategories(await getCategories());
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    setCategories(await getCategories());
  };

  return (
    <LocalDataContext.Provider
      value={{
        transactions,
        accounts,
        categories,
        refresh: load,
        addTransaction: handleAddTransaction,
        updateTransaction: handleUpdateTransaction,
        deleteTransaction: handleDeleteTransaction,
        addAccount: handleAddAccount,
        updateAccount: handleUpdateAccount,
        deleteAccount: handleDeleteAccount,
        addCategory: handleAddCategory,
        updateCategory: handleUpdateCategory,
        deleteCategory: handleDeleteCategory,
      }}
    >
      {children}
    </LocalDataContext.Provider>
  );
};

