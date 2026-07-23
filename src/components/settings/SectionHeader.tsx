import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({ title }) => {
  const { colors } = useTheme();
  return <Text style={[styles.title, { color: colors.text }]}>{title}</Text>;
});

SectionHeader.displayName = 'SectionHeader';

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
});
