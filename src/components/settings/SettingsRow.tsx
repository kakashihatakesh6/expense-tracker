import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

export const SettingsRow: React.FC<SettingsRowProps> = React.memo(({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onPress,
  rightElement,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityRole={onPress ? 'button' : 'none'}
      accessibilityLabel={`${title}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      
      <View style={styles.centerSection}>
        <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitleText} numberOfLines={1}>{subtitle}</Text>
        ) : null}
      </View>
      
      <View style={styles.rightSection}>
        {rightElement !== undefined ? (
          rightElement
        ) : onPress ? (
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        ) : null}
      </View>
    </Container>
  );
});

SettingsRow.displayName = 'SettingsRow';

const styles = StyleSheet.create({
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111111',
  },
  subtitleText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 30,
  },
});
