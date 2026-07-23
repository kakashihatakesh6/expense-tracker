import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Header } from '../../components/Header';
import { useExpenseStore } from '../../store/expenseStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  Search,
  SlidersHorizontal,
  Trash2,
  Edit2,
  Calendar,
  X,
  Plus,
} from 'lucide-react-native';
import { TransactionDetailModal } from '../../components/TransactionDetailModal';
import { Expense } from '../../types';
import { expenseHelpers } from '../../utils/expenseHelpers';

export default function ExpensesList() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  
  const { expenses, categories, fetchExpenses, deleteExpense } = useExpenseStore();
  const { settings } = useSettingsStore();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Expense | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const getCategoryColor = (catName: string) => {
    return categories.find((c) => c.name === catName)?.color || '#9CA3AF';
  };

  // 1. Filter expenses
  const filteredExpenses = expenses
    .filter((item) => {
      const matchSearch =
        item.merchant.toLowerCase().includes(search.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(search.toLowerCase())) ||
        item.amount.toString().includes(search);
      
      const matchCategory = selectedCategory ? item.category === selectedCategory : true;
      
      return matchSearch && matchCategory;
    })
    // 2. Sort expenses
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

  const handleDelete = (id: string, merchant: string) => {
    const targetExpense = expenses.find(e => e.id === id);
    const currencySymbol = expenseHelpers.getCurrencySymbol(targetExpense?.currency || settings.currency);
    Alert.alert(
      'Delete Transaction',
      `Are you sure you want to delete the expense of ${currencySymbol}${targetExpense?.amount.toFixed(2)} at ${merchant}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteExpense(id);
          },
        },
      ]
    );
  };

  const handleEdit = (id: string) => {
    router.push({
      pathname: '/modal/add-expense',
      params: { id },
    });
  };

  // Render Swipe actions
  const renderRightActions = (id: string, merchant: string) => (
    <View style={styles.rightActionContainer}>
      <TouchableOpacity
        style={[styles.editActionBtn, { backgroundColor: colors.primary }]}
        onPress={() => handleEdit(id)}
      >
        <Edit2 size={20} color="#FFF" />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.deleteActionBtn, { backgroundColor: colors.danger }]}
        onPress={() => handleDelete(id, merchant)}
      >
        <Trash2 size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header
          title="TRANSACTIONS"
          showBackButton={true}
          onBackPress={() => router.back()}
          rightIcon="plus"
          onRightPress={() => router.push('/modal/add-expense')}
        />
        <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Search & Sort Panel */}
        <View style={styles.filterBar}>
          <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Search size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search merchants, amounts..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.sortBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setShowSortOptions(!showSortOptions)}
          >
            <SlidersHorizontal size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Sort Options Dropdown */}
        {showSortOptions && (
          <Card style={[styles.sortCard, { borderColor: colors.border }]}>
            <Text style={[styles.sortTitle, { color: colors.textSecondary }]}>SORT BY</Text>
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
                >
                  <Text
                    style={[
                      styles.sortOptText,
                      { color: sortBy === opt.value ? colors.primary : colors.text },
                    ]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Category Filter Horizontal List */}
        <View style={styles.categoriesWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 'all', name: 'All' }, ...categories]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoryScroll}
            renderItem={({ item }) => {
              const isSelected =
                item.name === 'All' ? selectedCategory === null : selectedCategory === item.name;
              return (
                <TouchableOpacity
                  style={[
                    styles.categoryPill,
                    {
                      backgroundColor: isSelected ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() =>
                    setSelectedCategory(item.name === 'All' ? null : item.name)
                  }
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      { color: isSelected ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* Transactions list */}
        {filteredExpenses.length === 0 ? (
          <EmptyState
            icon={Search}
            title={search ? "No Matches Found" : "No Transactions Logged"}
            description={
              search
                ? "Try searching for a different keyword or check your spellings."
                : "You don't have any recorded transactions. Tap below to log one manually."
            }
            actionLabel={search ? undefined : "Add Transaction"}
            onAction={() => router.push('/modal/add-expense')}
          />
        ) : (
          <FlatList
            data={filteredExpenses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listPadding}
            renderItem={({ item }) => (
              <Swipeable
                renderRightActions={() => renderRightActions(item.id, item.merchant)}
                friction={2}
              >
                <TouchableOpacity onPress={() => setSelectedTransaction(item)} activeOpacity={0.7}>
                  <Card style={styles.transactionCard}>
                    <View style={styles.txRow}>
                      <View
                        style={[
                          styles.txCategoryDot,
                          { backgroundColor: getCategoryColor(item.category) },
                        ]}
                      />
                      <View style={styles.txDetails}>
                        <Text style={[styles.txMerchant, { color: colors.text }]} numberOfLines={1}>
                          {item.merchant}
                        </Text>
                        <Text style={[styles.txSub, { color: colors.textSecondary }]}>
                          {item.category} • {item.time}
                        </Text>
                        {item.notes ? (
                          <Text style={[styles.txNotes, { color: colors.textSecondary }]} numberOfLines={1}>
                            {"\""}{item.notes}{"\""}
                          </Text>
                        ) : null}
                      </View>
                      <View style={styles.amountCol}>
                        <Text style={[styles.txAmount, { color: colors.text }]}>
                          {expenseHelpers.getCurrencySymbol(item.currency || settings.currency)}
                          {item.amount.toFixed(2)}
                        </Text>
                        <View style={styles.dateBadge}>
                          <Calendar size={10} color={colors.textSecondary} />
                          <Text style={[styles.dateBadgeText, { color: colors.textSecondary }]}>
                            {item.date}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              </Swipeable>
            )}
          />
        )}

        {/* Floating Add Button */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/modal/add-expense')}
          activeOpacity={0.8}
        >
          <Plus size={24} color="#FFF" />
        </TouchableOpacity>
        
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  sortBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortCard: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
  },
  sortTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sortOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sortOptItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  sortOptText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoriesWrapper: {
    marginVertical: 12,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 6,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listPadding: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  transactionCard: {
    padding: 12,
    marginVertical: 4,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
  txNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 4,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: '500',
  },
  rightActionContainer: {
    flexDirection: 'row',
    width: 140,
    marginVertical: 4,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  editActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteActionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
