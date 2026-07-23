import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

interface HeaderProps {
  title?: string;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'SPENDLY',
  onMenuPress,
  onNotificationPress,
  notificationCount = 0,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          height: 65 + insets.top,
        },
      ]}
    >
      {/* Title Container (Absolutely Centered) */}
      <View style={[styles.titleContainer, { top: insets.top }]}>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* Left Action Button (Menu) */}
      <View style={styles.actionWrapper}>
        {onMenuPress ? (
          <Pressable
            onPress={onMenuPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Feather name="menu" size={20} color="#333333" />
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      {/* Right Action Button (Notifications) */}
      <View style={styles.actionWrapper}>
        {onNotificationPress ? (
          <Pressable
            onPress={onNotificationPress}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Feather name="bell" size={20} color="#333333" />
            
            {/* Red Notification Badge */}
            {notificationCount > 0 && (
              <View style={styles.badge}>
                {notificationCount > 9 && (
                  <Text style={styles.badgeText}>
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </Text>
                )}
              </View>
            )}
          </Pressable>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    // Subtle shadow below header
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  titleText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 22,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 2,
    textAlign: 'center',
  },
  actionWrapper: {
    zIndex: 2,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle elevation/shadow for the button
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  buttonPressed: {
    opacity: 0.7,
    backgroundColor: '#EEEEEE',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444', // Red circle
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    // Hidden unless custom text badge is preferred (e.g. for numbers)
    display: 'none',
  },
});
