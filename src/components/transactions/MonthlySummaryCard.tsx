import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';

interface MonthlySummaryCardProps {
  amount: number;
  changePercentage: number;
  currencySymbol: string;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = React.memo(({
  amount,
  changePercentage,
  currencySymbol,
}) => {
  const isNegative = changePercentage < 0;
  const formattedPercent = Math.abs(changePercentage).toFixed(1);

  return (
    <View style={styles.container}>
      <View style={styles.leftCol}>
        <Text style={styles.cardLabel}>{"This Month's Spending"}</Text>
        <Text 
          style={styles.amountText} 
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {currencySymbol}
          {amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>
      </View>

      <View
        style={[
          styles.badge,
          {
            backgroundColor: isNegative ? '#FEE2E2' : '#D1FAE5', // Light red or light green
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              color: isNegative ? '#EF4444' : '#10B981', // Red or green
            },
          ]}
        >
          {isNegative ? '▼' : '▲'} {isNegative ? '-' : '+'}{formattedPercent}%
        </Text>
      </View>
    </View>
  );
});

MonthlySummaryCard.displayName = 'MonthlySummaryCard';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  leftCol: {
    flex: 1,
    paddingRight: 8,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 6,
  },
  amountText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#111111',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
