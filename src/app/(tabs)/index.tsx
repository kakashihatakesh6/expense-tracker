import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTheme } from '../../hooks/useTheme';
import { expenseHelpers } from '../../utils/expenseHelpers';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import Svg, { Circle, Rect } from 'react-native-svg';
import {
  Plus,
  Scan,
  Image as ImageIcon,
  Compass,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  BadgeAlert,
} from 'lucide-react-native';

export default function Dashboard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  
  const { expenses, budgets, categories, fetchExpenses, fetchCategories, fetchBudgets, addExpense, saveBudget } =
    useExpenseStore();
  const { settings } = useSettingsStore();

  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | 'year'>('month');

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchBudgets();
  }, []);

  const todaySpend = expenseHelpers.getTodaySpend(expenses);
  const weeklySpend = expenseHelpers.getWeeklySpend(expenses);
  const monthlySpend = expenseHelpers.getMonthlySpend(expenses);
  const yearlySpend = expenseHelpers.getYearlySpend(expenses);

  const activeSpend =
    activeTab === 'today'
      ? todaySpend
      : activeTab === 'week'
      ? weeklySpend
      : activeTab === 'month'
      ? monthlySpend
      : yearlySpend;

  const currentMonthBudget =
    budgets.find((b) => b.category === 'All' && b.period === 'monthly')?.amount || 0;

  const recentExpenses = expenses.slice(0, 4);
  const insights = expenseHelpers.getSpendingInsights(expenses, budgets);

  const getCategoryColor = (catName: string) => {
    return categories.find((c) => c.name === catName)?.color || '#9CA3AF';
  };

  const seedSampleData = () => {
    Alert.alert(
      'Seed Sample Data',
      'This will populate your database with 8 mock transactions and a monthly budget of $1200 so you can test all features.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Seed Data',
          onPress: () => {
            const today = new Date().toISOString().split('T')[0];
            const getPastDate = (daysAgo: number) => {
              const d = new Date();
              d.setDate(d.getDate() - daysAgo);
              return d.toISOString().split('T')[0];
            };

            // Seed budget
            saveBudget({
              id: 'overall_monthly',
              category: 'All',
              amount: 1200,
              period: 'monthly',
            });

            // Seed category budgets
            saveBudget({
              id: 'food_budget',
              category: 'Food',
              amount: 300,
              period: 'monthly',
            });

            // Seed expenses
            const mockItems = [
              { id: 'm1', amount: 8.75, merchant: 'Starbucks Coffee', category: 'Food', date: today, time: '08:45', paymentMethod: 'Credit Card', currency: settings.currency, notes: 'Caffe Latte & Scone' },
              { id: 'm2', amount: 24.50, merchant: 'Uber Ride', category: 'Travel', date: getPastDate(1), time: '18:30', paymentMethod: 'Google Pay', currency: settings.currency, notes: 'Office to home' },
              { id: 'm3', amount: 85.20, merchant: 'Walmart Grocery', category: 'Grocery', date: getPastDate(1), time: '11:15', paymentMethod: 'Debit Card', currency: settings.currency, notes: 'Weekly groceries' },
              { id: 'm4', amount: 45.00, merchant: 'Shell Gas Station', category: 'Fuel', date: getPastDate(2), time: '07:30', paymentMethod: 'Cash', currency: settings.currency, notes: 'Fuel fillup' },
              { id: 'm5', amount: 15.49, merchant: 'Netflix Subscription', category: 'Entertainment', date: getPastDate(3), time: '00:00', paymentMethod: 'Credit Card', currency: settings.currency, notes: 'Monthly standard plan' },
              { id: 'm6', amount: 19.99, merchant: 'Amazon Charger', category: 'Shopping', date: getPastDate(4), time: '14:20', paymentMethod: 'Google Pay', currency: settings.currency, notes: 'Wireless charging pad' },
              { id: 'm7', amount: 79.99, merchant: 'Comcast Broadband', category: 'Bills', date: getPastDate(5), time: '10:00', paymentMethod: 'UPI (GPay)', currency: settings.currency, notes: 'WiFi bill' },
              { id: 'm8', amount: 125.00, merchant: 'CVS Pharmacy', category: 'Health', date: getPastDate(6), time: '16:45', paymentMethod: 'Credit Card', currency: settings.currency, notes: 'Vitamins & meds' },
            ];

            for (const item of mockItems) {
              addExpense(item);
            }

            Alert.alert('Success', 'Sample data successfully seeded! Restarting views.');
            fetchExpenses();
            fetchBudgets();
          },
        },
      ]
    );
  };

  // Render Category Pie Chart via custom SVG for robust, light styling
  const renderMiniCategoryChart = () => {
    const data = expenseHelpers.getCategorySpending(expenses, categories);
    if (data.length === 0) return null;

    let accumulatedAngle = 0;
    const radius = 40;
    const strokeWidth = 14;
    const circumference = 2 * Math.PI * radius;

    return (
      <View style={styles.chartContainer}>
        <Svg height="110" width="110" viewBox="0 0 110 110">
          <Circle cx="55" cy="55" r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="transparent" />
          {data.map((cat, idx) => {
            const percentage = cat.amount / expenses.reduce((sum, e) => sum + e.amount, 0);
            const strokeDashoffset = circumference - percentage * circumference;
            const rotation = (accumulatedAngle * 360) / circumference - 90;
            accumulatedAngle += percentage * circumference;

            return (
              <Circle
                key={idx}
                cx="55"
                cy="55"
                r={radius}
                stroke={cat.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(${rotation} 55 55)`}
              />
            );
          })}
        </Svg>
        <View style={styles.chartLegend}>
          {data.slice(0, 4).map((cat, idx) => (
            <View key={idx} style={styles.legendItem}>
              <View style={[styles.legendIndicator, { backgroundColor: cat.color }]} />
              <Text style={[styles.legendText, { color: colors.text }]} numberOfLines={1}>
                {cat.name} ({cat.percentage}%)
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} color={colors.danger} />;
      case 'success':
        return <CheckCircle size={18} color={colors.success} />;
      default:
        return <Info size={18} color={colors.info} />;
    }
  };

  const getInsightBg = (type: string) => {
    if (type === 'warning') return isDark ? '#3b1c1c' : '#fee2e2';
    if (type === 'success') return isDark ? '#1c3b2b' : '#d1fae5';
    return colors.primaryLight;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Spending Summary Card */}
      <View style={styles.summaryHeader}>
        <View style={styles.tabContainer}>
          {(['today', 'week', 'month', 'year'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabItem,
                activeTab === tab && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? '#FFF' : colors.textSecondary },
                ]}
              >
                {tab.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Card style={styles.spendCard} glassmorphism>
          <Text style={[styles.spendLabel, { color: colors.textSecondary }]}>
            TOTAL SPENDING ({activeTab.toUpperCase()})
          </Text>
          <Text style={[styles.spendAmount, { color: colors.text }]}>
            {settings.currency === 'INR' ? '₹' : '$'}
            {activeSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          {expenses.length > 0 && renderMiniCategoryChart()}
        </Card>
      </View>

      {/* 2. Quick Actions Deck */}
      <View style={styles.actionsDeck}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.card }]}
          onPress={() => router.push('/modal/scan')}
        >
          <View style={[styles.actionIconBg, { backgroundColor: colors.primaryLight }]}>
            <Scan size={20} color={colors.primary} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Scan Receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.card }]}
          onPress={() => router.push('/modal/screenshot')}
        >
          <View style={[styles.actionIconBg, { backgroundColor: colors.primaryLight }]}>
            <ImageIcon size={20} color={colors.primary} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Import UPI</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.card }]}
          onPress={() => router.push('/modal/add-expense')}
        >
          <View style={[styles.actionIconBg, { backgroundColor: colors.primaryLight }]}>
            <Plus size={20} color={colors.primary} />
          </View>
          <Text style={[styles.actionText, { color: colors.text }]}>Manual Add</Text>
        </TouchableOpacity>
      </View>

      {/* 3. Budget Status Progress */}
      {currentMonthBudget > 0 ? (
        <Card style={[styles.budgetCard, { borderColor: colors.border }]}>
          <View style={styles.budgetHeader}>
            <View>
              <Text style={[styles.budgetTitle, { color: colors.text }]}>Monthly Budget Goal</Text>
              <Text style={[styles.budgetSub, { color: colors.textSecondary }]}>
                {settings.currency === 'INR' ? '₹' : '$'}
                {monthlySpend.toFixed(0)} of {settings.currency === 'INR' ? '₹' : '$'}
                {currentMonthBudget.toFixed(0)} used
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/modal/budget')}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Manage</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#1f293d' : '#e5e7eb' }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: monthlySpend > currentMonthBudget ? colors.danger : colors.success,
                  width: `${Math.min(100, (monthlySpend / currentMonthBudget) * 100)}%`,
                },
              ]}
            />
          </View>

          {monthlySpend > currentMonthBudget && (
            <View style={styles.budgetAlertTextRow}>
              <BadgeAlert size={14} color={colors.danger} />
              <Text style={[styles.budgetAlertText, { color: colors.danger }]}>
                Budget limit exceeded by {settings.currency === 'INR' ? '₹' : '$'}
                {(monthlySpend - currentMonthBudget).toFixed(2)}!
              </Text>
            </View>
          )}
        </Card>
      ) : (
        <Card style={styles.budgetEmptyCard}>
          <Text style={[styles.budgetEmptyText, { color: colors.text }]}>No overall budget configured</Text>
          <TouchableOpacity
            style={[styles.budgetSetupBtn, { backgroundColor: colors.primaryLight }]}
            onPress={() => router.push('/modal/budget')}
          >
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Set Budget Goal</Text>
          </TouchableOpacity>
        </Card>
      )}

      {/* 4. Spending Insights */}
      <View style={styles.sectionHeader}>
        <Sparkles size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Spending Insights</Text>
      </View>
      <View style={styles.insightsList}>
        {insights.map((insight) => (
          <View
            key={insight.id}
            style={[
              styles.insightItem,
              { backgroundColor: getInsightBg(insight.type), borderColor: colors.border },
            ]}
          >
            <View style={styles.insightIconColumn}>{getInsightIcon(insight.type)}</View>
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: colors.text }]}>{insight.title}</Text>
              <Text style={[styles.insightDesc, { color: colors.textSecondary }]}>
                {insight.description}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* 5. Recent Transactions */}
      <View style={styles.sectionHeader}>
        <TrendingUp size={18} color={colors.primary} />
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
        <TouchableOpacity
          style={styles.seeAllBtn}
          onPress={() => router.push('/(tabs)/expenses')}
        >
          <Text style={{ color: colors.primary, fontWeight: '600' }}>See All</Text>
          <ArrowRight size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {recentExpenses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon={Compass}
            title="No Transactions Logged"
            description="You have not added any transactions yet. Populate the app with sample data to preview the full layout."
            actionLabel="Seed Sample Data"
            onAction={seedSampleData}
          />
        </View>
      ) : (
        <View style={styles.recentList}>
          {recentExpenses.map((expense) => (
            <Card key={expense.id} style={styles.transactionItem}>
              <View style={styles.txRow}>
                <View
                  style={[
                    styles.txCategoryDot,
                    { backgroundColor: getCategoryColor(expense.category) },
                  ]}
                />
                <View style={styles.txDetails}>
                  <Text style={[styles.txMerchant, { color: colors.text }]} numberOfLines={1}>
                    {expense.merchant}
                  </Text>
                  <Text style={[styles.txSub, { color: colors.textSecondary }]}>
                    {expense.category} • {expense.date}
                  </Text>
                </View>
                <Text style={[styles.txAmount, { color: colors.text }]}>
                  {settings.currency === 'INR' ? '₹' : '$'}
                  {expense.amount.toFixed(2)}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  summaryHeader: {
    marginBottom: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 20,
    padding: 2,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 18,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  spendCard: {
    padding: 20,
  },
  spendLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  spendAmount: {
    fontSize: 32,
    fontWeight: '800',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    justifyContent: 'space-between',
  },
  chartLegend: {
    flex: 1,
    marginLeft: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsDeck: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 16,
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.02)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetCard: {
    padding: 16,
    marginBottom: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  budgetTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  budgetSub: {
    fontSize: 12,
    marginTop: 2,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetAlertTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  budgetAlertText: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetEmptyCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderStyle: 'dashed',
    borderWidth: 1.5,
  },
  budgetEmptyText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  budgetSetupBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  insightsList: {
    marginBottom: 20,
  },
  insightItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 4,
  },
  insightIconColumn: {
    marginRight: 10,
    justifyContent: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  insightDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
  },
  recentList: {
    marginBottom: 20,
  },
  transactionItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txCategoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
    marginRight: 8,
  },
  txMerchant: {
    fontSize: 14,
    fontWeight: '700',
  },
  txSub: {
    fontSize: 12,
    marginTop: 2,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
});
