import { supabase } from '../lib/supabase';
import { Expense } from '../types';

function toSupabase(expense: Expense, userId: string) {
  const isTempId = expense.id.startsWith('exp_');
  return {
    ...(isTempId ? {} : { id: expense.id }),
    user_id: userId,
    merchant: expense.merchant,
    amount: expense.amount,
    currency: expense.currency,
    category: expense.category,
    payment_method: expense.paymentMethod,
    transaction_date: expense.date,
    notes: expense.notes || null,
    receipt_image: expense.receiptImage || null,
  };
}

function fromSupabase(row: any): Expense {
  const localTime = row.created_at 
    ? new Date(row.created_at).toTimeString().slice(0, 5) 
    : '12:00';

  return {
    id: row.id,
    amount: typeof row.amount === 'number' ? row.amount : parseFloat(row.amount),
    merchant: row.merchant,
    category: row.category,
    date: row.transaction_date,
    time: localTime,
    paymentMethod: row.payment_method,
    currency: row.currency,
    notes: row.notes || undefined,
    receiptImage: row.receipt_image || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isSynced: 1,
  };
}

export const dbService = {
  async getExpenses(): Promise<Expense[]> {
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return (data || []).map(fromSupabase);
  },

  async getExpenseById(id: string): Promise<Expense | null> {
    if (id.startsWith('exp_')) return null;
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return fromSupabase(data);
  },

  async createExpense(expense: Expense, userId: string): Promise<Expense> {
    const payload = toSupabase(expense, userId);
    const { data, error } = await supabase
      .from('expenses')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return fromSupabase(data);
  },

  async updateExpense(expense: Expense, userId: string): Promise<Expense> {
    const payload = toSupabase(expense, userId);
    const { data, error } = await supabase
      .from('expenses')
      .update(payload)
      .eq('id', expense.id)
      .select()
      .single();

    if (error) throw error;
    return fromSupabase(data);
  },

  async deleteExpense(id: string): Promise<void> {
    if (id.startsWith('exp_')) return;

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
