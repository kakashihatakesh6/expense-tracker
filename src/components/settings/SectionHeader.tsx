import React from 'react';
import { StyleSheet, Text } from 'react-native';

interface SectionHeaderProps {
  title: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(({ title }) => {
  return <Text style={styles.title}>{title}</Text>;
});

SectionHeader.displayName = 'SectionHeader';

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111111',
    marginTop: 20,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
});
