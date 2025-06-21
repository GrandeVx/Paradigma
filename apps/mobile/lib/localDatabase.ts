import * as SQLite from 'expo-sqlite';

export interface Account {
  id: string;
  name: string;
  type?: string;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string; // ISO string
}

const db = SQLite.openDatabase('balance.db');

export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY NOT NULL, name TEXT, type TEXT, balance REAL);'
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY NOT NULL, name TEXT, color TEXT);'
      );
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS transactions (id TEXT PRIMARY KEY NOT NULL, accountId TEXT, categoryId TEXT, amount REAL, description TEXT, date TEXT);'
      );
    }, reject, resolve);
  });
};

const executeSql = <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        sql,
        params,
        (_, { rows }) => {
          const result: T[] = [];
          for (let i = 0; i < rows.length; i++) {
            result.push(rows.item(i));
          }
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false;
        }
      );
    });
  });
};

// Account helpers
export const getAccounts = () => executeSql<Account>('SELECT * FROM accounts');
export const addAccount = (acc: Account) =>
  executeSql('INSERT INTO accounts (id, name, type, balance) VALUES (?, ?, ?, ?)', [acc.id, acc.name, acc.type, acc.balance]).then(() => []);
export const updateAccount = (acc: Account) =>
  executeSql('UPDATE accounts SET name = ?, type = ?, balance = ? WHERE id = ?', [acc.name, acc.type, acc.balance, acc.id]).then(() => []);
export const deleteAccount = (id: string) =>
  executeSql('DELETE FROM accounts WHERE id = ?', [id]).then(() => []);

// Category helpers
export const getCategories = () => executeSql<Category>('SELECT * FROM categories');
export const addCategory = (cat: Category) =>
  executeSql('INSERT INTO categories (id, name, color) VALUES (?, ?, ?)', [cat.id, cat.name, cat.color]).then(() => []);
export const updateCategory = (cat: Category) =>
  executeSql('UPDATE categories SET name = ?, color = ? WHERE id = ?', [cat.name, cat.color, cat.id]).then(() => []);
export const deleteCategory = (id: string) =>
  executeSql('DELETE FROM categories WHERE id = ?', [id]).then(() => []);

// Transaction helpers
export const getTransactions = () => executeSql<Transaction>('SELECT * FROM transactions');
export const addTransaction = (tx: Transaction) =>
  executeSql('INSERT INTO transactions (id, accountId, categoryId, amount, description, date) VALUES (?, ?, ?, ?, ?, ?)', [tx.id, tx.accountId, tx.categoryId, tx.amount, tx.description, tx.date]).then(() => []);
export const updateTransaction = (tx: Transaction) =>
  executeSql('UPDATE transactions SET accountId = ?, categoryId = ?, amount = ?, description = ?, date = ? WHERE id = ?', [tx.accountId, tx.categoryId, tx.amount, tx.description, tx.date, tx.id]).then(() => []);
export const deleteTransaction = (id: string) =>
  executeSql('DELETE FROM transactions WHERE id = ?', [id]).then(() => []);

