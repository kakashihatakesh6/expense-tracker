import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useExpenseStore } from '../store/expenseStore';
import { useSettingsStore } from '../store/settingsStore';
import { useTheme } from '../hooks/useTheme';
import { useCurrencyStore } from '../store/currencyStore';
import { expenseHelpers } from '../utils/expenseHelpers';
import { Header } from '../components/Header';
import { SearchBar } from '../components/transactions/SearchBar';
import { TransactionFilters } from '../components/transactions/TransactionFilters';
import { MonthlySummaryCard } from '../components/transactions/MonthlySummaryCard';
import { TransactionCard } from '../components/transactions/TransactionCard';
import { Skeleton } from '../components/Skeleton';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { Edit2, Trash2, Plus } from 'lucide-react-native';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import Animated, { FadeInDown, SlideInUp } from 'react-native-reanimated';
import { Expense } from '../types';

export const TransactionsScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();


  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  const { expenses, categories, fetchExpenses, deleteExpense, isLoading } = useExpenseStore();
  const { settings } = useSettingsStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [showCategoryPills, setShowCategoryPills] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Expense | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const convert = useCurrencyStore.getState().convert;
  
  // Calculate total monthly spending and compare to previous month
  const monthlyData = useMemo(() => {
    const currentMonthStr = expenseHelpers.getLocalDateString().slice(0, 7); // YYYY-MM
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthStr = expenseHelpers.getLocalDateString(lastMonthDate).slice(0, 7);

    const currentMonthSpend = expenses
      .filter((e) => e.date.startsWith(currentMonthStr))
      .reduce((sum, e) => {
        const amt = convert(Number(e.amount), e.currency || 'INR', 'INR');
        return sum + amt;
      }, 0);

    const lastMonthSpend = expenses
      .filter((e) => e.date.startsWith(lastMonthStr))
      .reduce((sum, e) => {
        const amt = convert(Number(e.amount), e.currency || 'INR', 'INR');
        return sum + amt;
      }, 0);

    let changePercentage = 0;
    if (lastMonthSpend > 0) {
      changePercentage = ((currentMonthSpend - lastMonthSpend) / lastMonthSpend) * 100;
    } else if (currentMonthSpend > 0) {
      changePercentage = 100;
    }

    return {
      currentMonthSpend,
      changePercentage,
    };
  }, [expenses, convert]);

  const currencySymbol = useMemo(() => {
    return expenseHelpers.getCurrencySymbol(settings.currency);
  }, [settings.currency]);

  const selectedSortLabel = useMemo(() => {
    switch (sortBy) {
      case 'date-desc':
        return 'Date: Newest';
      case 'date-asc':
        return 'Date: Oldest';
      case 'amount-desc':
        return 'Amount: High-Low';
      case 'amount-asc':
        return 'Amount: Low-High';
      default:
        return 'Sort Date';
    }
  }, [sortBy]);

  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter((item) => {
        const matchSearch =
          item.merchant.toLowerCase().includes(search.toLowerCase()) ||
          (item.notes && item.notes.toLowerCase().includes(search.toLowerCase())) ||
          item.amount.toString().includes(search);
        
        const matchCategory = selectedCategory ? item.category === selectedCategory : true;
        
        return matchSearch && matchCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
        }
        if (sortBy === 'date-asc') {
          return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [expenses, search, selectedCategory, sortBy]);

  const handleDelete = useCallback((id: string, merchant: string) => {
    const targetExpense = expenses.find(e => e.id === id);
    const symbol = expenseHelpers.getCurrencySymbol(targetExpense?.currency || settings.currency);
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete the expense of ${symbol}${targetExpense?.amount.toFixed(2)} at ${merchant}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteExpense(id),
        },
      ]
    );
  }, [expenses, settings.currency, deleteExpense]);

  const handleEdit = useCallback((id: string) => {
    router.push({
      pathname: '/modal/add-expense',
      params: { id },
    });
  }, [router]);

  const renderRightSwipeActions = useCallback((id: string, merchant: string) => (
    <View style={styles.swipeActionsContainer}>
      <TouchableOpacity
        style={[styles.swipeBtn, { backgroundColor: colors.primary }]}
        onPress={() => handleEdit(id)}
        activeOpacity={0.7}
      >
        <Edit2 size={20} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.swipeBtn, { backgroundColor: colors.danger }]}
        onPress={() => handleDelete(id, merchant)}
        activeOpacity={0.7}
      >
        <Trash2 size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  ), [colors, handleEdit, handleDelete]);

  const handleSelectCategory = useCallback((catName: string | null) => {
    setSelectedCategory(catName);
    setShowCategoryPills(false);
  }, []);

  const toggleSortOptions = useCallback(() => {
    setShowSortOptions(prev => !prev);
    setShowCategoryPills(false);
  }, []);

  const toggleCategoryPills = useCallback(() => {
    setShowCategoryPills(prev => !prev);
    setShowSortOptions(prev => false);
  }, []);



  const renderCategoryDropdown = () => {
    if (!showCategoryPills) return null;
    return (
      <View style={styles.dropdownContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'All' }, ...categories]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryScroll}
          renderItem={({ item }) => {
            const isSelected = item.name === 'All' ? selectedCategory === null : selectedCategory === item.name;
            return (
              <TouchableOpacity
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: isSelected ? colors.primary : '#FFFFFF',
                    borderColor: isSelected ? colors.primary : '#EAEAEA',
                  },
                ]}
                onPress={() => handleSelectCategory(item.name === 'All' ? null : item.name)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: isSelected ? '#FFFFFF' : '#111111' },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    );
  };

  const renderSortDropdown = () => {
    if (!showSortOptions) return null;
    return (
      <View style={styles.dropdownContainer}>
        <View style={styles.sortOptionsGrid}>
          {[
            { label: 'Date: Newest', value: 'date-desc' },
            { label: 'Date: Oldest', value: 'date-asc' },
            { label: 'Amount: High to Low', value: 'amount-desc' },
            { label: 'Amount: Low to High', value: 'amount-asc' },
          ].map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.sortOptItem,
                sortBy === opt.value && { backgroundColor: colors.primaryLight },
              ]}
              onPress={() => {
                setSortBy(opt.value as any);
                setShowSortOptions(false);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.sortOptText,
                  { color: sortBy === opt.value ? colors.primary : '#111111' },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderItem = ({ item, index }: { item: Expense; index: number }) => (
    <Animated.View entering={FadeInDown.duration(350).delay(index * 40)}>
      <Swipeable
        renderRightActions={() => renderRightSwipeActions(item.id, item.merchant)}
        friction={2}
      >
        <TransactionCard
          transaction={item}
          onPress={() => setSelectedTransaction(item)}
          currencySymbol={currencySymbol}
        />
      </Swipeable>
    </Animated.View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.safeArea}>
        <Header
          title="TRANSACTIONS"
          showBackButton={true}
          onBackPress={() => router.back()}
          rightIcon="sliders"
          onRightPress={toggleSortOptions}
        />

        <Animated.View entering={SlideInUp.duration(400)}>
          <SearchBar value={search} onChangeText={setSearch} />
          
          <TransactionFilters
            onDatePress={toggleSortOptions}
            onCategoryPress={toggleCategoryPills}
            selectedCategory={selectedCategory}
            selectedSortLabel={selectedSortLabel}
          />
        </Animated.View>

        {renderSortDropdown()}
        {renderCategoryDropdown()}

        {isLoading ? (
          <View style={styles.listContainer}>
            <View style={{ height: 20 }} />
            {Array.from({ length: 4 }).map((_, idx) => (
              <View key={idx} style={styles.cardSkeleton}>
                <Skeleton width={44} height={44} borderRadius={22} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Skeleton width="60%" height={16} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width="40%" height={12} borderRadius={4} />
                </View>
                <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                  <Skeleton width={50} height={12} borderRadius={4} style={{ marginBottom: 4 }} />
                  <Skeleton width={70} height={16} borderRadius={4} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            data={filteredAndSortedExpenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={renderItem}
            ListHeaderComponent={
              <MonthlySummaryCard
                amount={monthlyData.currentMonthSpend}
                changePercentage={monthlyData.changePercentage}
                currencySymbol={currencySymbol}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyWrapper}>
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="receipt-outline" size={64} color="#C7C7CC" style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyTitle}>No Transactions Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Your scanned receipts and manual expenses will appear here.
                  </Text>
                  <TouchableOpacity
                    style={[styles.addExpenseBtn, { backgroundColor: colors.primary }]}
                    onPress={() => router.push('/modal/add-expense')}
                    activeOpacity={0.8}
                  >
                    <Plus size={18} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={styles.addExpenseBtnText}>Add Expense</Text>
                  </TouchableOpacity>
                </View>
              </View>
            }
          />
        )}

        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },

  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    paddingVertical: 12,
    zIndex: 10,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
  },
  sortOptItem: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F5F5F7',
  },
  sortOptText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  swipeActionsContainer: {
    flexDirection: 'row',
    width: 140,
    marginBottom: 12,
    marginRight: 16,
    borderRadius: 18,
    overflow: 'hidden',
  },
  swipeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
  },
  emptyWrapper: {
    paddingHorizontal: 16,
    marginTop: 40,
  },
  emptyStateContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  addExpenseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  addExpenseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
