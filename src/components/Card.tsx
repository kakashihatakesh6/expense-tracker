import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface CardProps extends ViewProps {
  glassmorphism?: boolean;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  glassmorphism = false,
  elevation = 1,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: glassmorphism
            ? isDark
              ? 'rgba(21, 29, 48, 0.7)'
              : 'rgba(255, 255, 255, 0.7)'
            : colors.card,
          borderColor: colors.border,
          shadowColor: isDark ? '#000' : 'rgba(99, 102, 241, 0.1)',
          shadowOpacity: isDark ? 0.3 : 0.08,
          shadowRadius: elevation * 4,
          shadowOffset: { width: 0, height: elevation * 2 },
          elevation: elevation,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
});
