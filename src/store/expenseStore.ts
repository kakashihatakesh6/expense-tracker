import { create } from 'zustand';
import { Expense, Category, Budget } from '../types';
import { expenseRepository } from '../database/repositories/expenseRepository';

interface ExpenseState {
  expenses: Expense[];
  categories: Category[];
  budgets: Budget[];
  isLoading: boolean;
  
  fetchExpenses: () => void;
  fetchCategories: () => void;
  fetchBudgets: () => void;
  
  addExpense: (expenseData: Omit<Expense, 'createdAt' | 'updatedAt' | 'isSynced'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  
  saveBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
}

export const useExpenseStore = create<ExpenseState>((set, get) => ({
  expenses: [],
  categories: [],
  budgets: [],
  isLoading: false,

  fetchExpenses: () => {
    set({ isLoading: true });
    try {
      const expenses = expenseRepository.getAllExpenses();
      set({ expenses, isLoading: false });
    } catch (error) {
      console.error('Error fetching expenses from DB:', error);
      set({ isLoading: false });
    }
  },

  fetchCategories: () => {
    try {
      const categories = expenseRepository.getAllCategories();
      set({ categories });
    } catch (error) {
      console.error('Error fetching categories from DB:', error);
    }
  },

  fetchBudgets: () => {
    try {
      const budgets = expenseRepository.getAllBudgets();
      set({ budgets });
    } catch (error) {
      console.error('Error fetching budgets from DB:', error);
    }
  },

  addExpense: (expenseData) => {
    try {
      const now = new Date().toISOString();
      const expense: Expense = {
        ...expenseData,
        createdAt: now,
        updatedAt: now,
        isSynced: 0,
      };
      
      expenseRepository.createExpense(expense);
      
      set((state) => ({
        expenses: [expense, ...state.expenses],
      }));
    } catch (error) {
      console.error('Error adding expense to DB:', error);
    }
  },

  updateExpense: (expense) => {
    try {
      const now = new Date().toISOString();
      const updatedExpense: Expense = {
        ...expense,
        updatedAt: now,
        isSynced: 0,
      };

      expenseRepository.updateExpense(updatedExpense);

      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === expense.id ? updatedExpense : e)),
      }));
    } catch (error) {
      console.error('Error updating expense in DB:', error);
    }
  },

  deleteExpense: (id) => {
    try {
      expenseRepository.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting expense from DB:', error);
    }
  },

  saveBudget: (budget) => {
    try {
      expenseRepository.saveBudget(budget);
      
      set((state) => {
        const index = state.budgets.findIndex((b) => b.id === budget.id);
        if (index > -1) {
          const updatedBudgets = [...state.budgets];
          updatedBudgets[index] = budget;
          return { budgets: updatedBudgets };
        } else {
          return { budgets: [...state.budgets, budget] };
        }
      });
    } catch (error) {
      console.error('Error saving budget to DB:', error);
    }
  },

  deleteBudget: (id) => {
    try {
      expenseRepository.deleteBudget(id);
      set((state) => ({
        budgets: state.budgets.filter((b) => b.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting budget from DB:', error);
    }
  },
}));
