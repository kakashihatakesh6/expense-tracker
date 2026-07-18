import { Expense, Budget, SpendingInsight } from '../types';

export const expenseHelpers = {
  getCurrencySymbol(currency: string = 'INR'): string {
    switch (currency) {
      case 'USD':
        return '$';
      case 'EUR':
        return '€';
      case 'GBP':
        return '£';
      case 'INR':
      default:
        return '₹';
    }
  },

  getLocalDateString(d: Date = new Date()): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  getTodaySpend(expenses: Expense[]): number {
    const today = this.getLocalDateString();
    return expenses
      .filter((e) => e.date === today)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  },

  getWeeklySpend(expenses: Expense[]): number {
    // Current week from Sunday
    const today = new Date();
    const currentDay = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay);
    const startStr = this.getLocalDateString(sunday);

    return expenses
      .filter((e) => e.date >= startStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  },

  getMonthlySpend(expenses: Expense[]): number {
    const currentMonth = this.getLocalDateString().slice(0, 7); // YYYY-MM
    return expenses
      .filter((e) => e.date.startsWith(currentMonth))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  },

  getYearlySpend(expenses: Expense[]): number {
    const currentYear = this.getLocalDateString().slice(0, 4); // YYYY
    return expenses
      .filter((e) => e.date.startsWith(currentYear))
      .reduce((sum, e) => sum + Number(e.amount), 0);
  },

  getCategorySpending(expenses: Expense[], categoriesList: any[]): { name: string; amount: number; percentage: number; color: string; icon: string }[] {
    const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    if (total === 0) return [];

    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount);
    });

    return Object.keys(map).map((catName) => {
      const catObj = categoriesList.find((c) => c.name === catName) || {
        color: '#C7C7CC',
        icon: 'dots-horizontal',
      };
      const amount = map[catName];
      return {
        name: catName,
        amount,
        percentage: Math.round((amount / total) * 100),
        color: catObj.color,
        icon: catObj.icon,
      };
    }).sort((a, b) => b.amount - a.amount);
  },

  getWeeklySpendingData(expenses: Expense[]): { day: string; amount: number }[] {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = days.map((day) => ({ day, amount: 0 }));

    // Get current week start (Sunday)
    const today = new Date();
    const currentDay = today.getDay();
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay);
    sunday.setHours(0, 0, 0, 0);

    expenses.forEach((e) => {
      const expenseDate = new Date(e.date + 'T00:00:00');
      if (expenseDate >= sunday) {
        const dayIdx = expenseDate.getDay();
        result[dayIdx].amount += Number(e.amount);
      }
    });

    return result;
  },

  getMonthlyTrendData(expenses: Expense[]): { month: string; amount: number }[] {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const result = months.map((month) => ({ month, amount: 0 }));
    
    const currentYear = new Date().getFullYear();

    expenses.forEach((e) => {
      const expenseDate = new Date(e.date + 'T00:00:00');
      if (expenseDate.getFullYear() === currentYear) {
        const monthIdx = expenseDate.getMonth();
        result[monthIdx].amount += Number(e.amount);
      }
    });

    // Return the last 6 months or current year-to-date
    const currentMonthIdx = new Date().getMonth();
    const startIndex = Math.max(0, currentMonthIdx - 5);
    return result.slice(startIndex, currentMonthIdx + 1);
  },

  getSpendingInsights(expenses: Expense[], budgets: Budget[], currency: string = 'INR'): SpendingInsight[] {
    const insights: SpendingInsight[] = [];
    const today = this.getLocalDateString();
    const symbol = this.getCurrencySymbol(currency);

    if (expenses.length === 0) {
      insights.push({
        id: '1',
        title: 'Start Logging Expenses',
        description: 'You have no transactions logged. Tap the "+" button below or scan a receipt to get started!',
        type: 'info',
        date: today,
      });
      return insights;
    }

    // 1. Largest transaction alert
    const sorted = [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount));
    const largest = sorted[0];
    if (Number(largest.amount) > 100) {
      insights.push({
        id: 'largest_spend',
        title: 'High Single Spend detected',
        description: `Your largest single expense was ${symbol}${Number(largest.amount).toFixed(2)} at ${largest.merchant} under ${largest.category}.`,
        type: 'warning',
        date: today,
      });
    }

    // 2. Budget status
    const monthlySpend = this.getMonthlySpend(expenses);
    const totalBudget = budgets.find((b) => b.category === 'All' && b.period === 'monthly')?.amount || 0;
    
    if (totalBudget > 0) {
      const pct = (monthlySpend / totalBudget) * 100;
      if (pct >= 100) {
        insights.push({
          id: 'budget_exceeded',
          title: 'Monthly Limit Exceeded!',
          description: `You have spent ${symbol}${monthlySpend.toFixed(2)}, which is ${(pct - 100).toFixed(0)}% over your total monthly budget of ${symbol}${totalBudget.toFixed(2)}.`,
          type: 'warning',
          date: today,
        });
      } else if (pct >= 80) {
        insights.push({
          id: 'budget_alert',
          title: 'Nearing Budget Limit',
          description: `You have used ${pct.toFixed(0)}% of your monthly budget (${symbol}${monthlySpend.toFixed(2)} of ${symbol}${totalBudget.toFixed(2)}).`,
          type: 'warning',
          date: today,
        });
      } else {
        insights.push({
          id: 'budget_ok',
          title: 'Budget on Track',
          description: `You have used ${pct.toFixed(0)}% of your monthly budget. Keep it up!`,
          type: 'success',
          date: today,
        });
      }
    } else {
      insights.push({
        id: 'no_budget',
        title: 'Set Spending Limits',
        description: 'Configure budgets in Settings to track your monthly goals and receive notifications.',
        type: 'info',
        date: today,
      });
    }

    // 3. Category concentration
    const catList = this.getCategorySpending(expenses, []);
    if (catList.length > 0 && catList[0].percentage > 40) {
      insights.push({
        id: 'category_concentration',
        title: `Heavy ${catList[0].name} Spending`,
        description: `${catList[0].percentage}% of your expenses are concentrated in "${catList[0].name}" (${symbol}${Number(catList[0].amount).toFixed(2)}).`,
        type: 'info',
        date: today,
      });
    }

    return insights;
  },
};
