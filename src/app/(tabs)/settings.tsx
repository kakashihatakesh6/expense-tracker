import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Header } from '../../components/Header';
import { useSettingsStore } from '../../store/settingsStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/Card';
import { exportService } from '../../services/exportService';
import { notificationService } from '../../services/notificationService';
import { expenseHelpers } from '../../utils/expenseHelpers';
import {
  Moon,
  Sun,
  Globe,
  Bell,
  Download,
  Upload,
  Cpu,
  Info,
  IndianRupee,
  LogOut,
  AlertTriangle,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, theme, isDark } = useTheme();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  
  const { 
    settings, 
    setTheme, 
    setCurrency, 
    setNotificationsEnabled, 
    setAiCategorizationEnabled, 
    setOcrEngine, 
    setGeminiApiKey,
    setNotificationTime,
    setBudgetWarningEnabled,
    setBudgetWarningThreshold,
  } = useSettingsStore();
  const { expenses } = useExpenseStore();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const handleThemeChange = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const selectCurrency = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred base currency symbol:',
      [
        { text: 'USD ($)', onPress: () => setCurrency('USD') },
        { text: 'INR (₹)', onPress: () => setCurrency('INR') },
        { text: 'EUR (€)', onPress: () => setCurrency('EUR') },
        { text: 'GBP (£)', onPress: () => setCurrency('GBP') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleExportCSV = async () => {
    if (expenses.length === 0) {
      Alert.alert('No Data', 'You have no transactions to export.');
      return;
    }
    try {
      const path = await exportService.exportToCSV(expenses);
      Alert.alert('Export Successful', `Expenses CSV file successfully created and saved to:\n\n${path}`);
    } catch (e) {
      Alert.alert('Export Failed', 'An error occurred during CSV creation.');
    }
  };

  const handleExportJSON = async () => {
    if (expenses.length === 0) {
      Alert.alert('No Data', 'You have no transactions to backup.');
      return;
    }
    try {
      const path = await exportService.exportToJSON(expenses);
      Alert.alert('Backup Complete', `JSON Database backup successfully saved to:\n\n${path}`);
    } catch (e) {
      Alert.alert('Backup Failed', 'An error occurred during backup creation.');
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const displayMinute = minute < 10 ? `0${minute}` : minute;
    return `${displayHour}:${displayMinute} ${ampm}`;
  };

  const handleAdjustHour = (amount: number) => {
    const currentHour = settings.notificationHour !== undefined ? settings.notificationHour : 20;
    const currentMinute = settings.notificationMinute !== undefined ? settings.notificationMinute : 0;
    const nextHour = (currentHour + amount + 24) % 24;
    setNotificationTime(nextHour, currentMinute);
    if (settings.notificationsEnabled) {
      notificationService.scheduleDailyReminder(nextHour, currentMinute);
    }
  };

  const handleAdjustMinute = (amount: number) => {
    const currentHour = settings.notificationHour !== undefined ? settings.notificationHour : 20;
    const currentMinute = settings.notificationMinute !== undefined ? settings.notificationMinute : 0;
    const nextMinute = (currentMinute + amount + 60) % 60;
    setNotificationTime(currentHour, nextMinute);
    if (settings.notificationsEnabled) {
      notificationService.scheduleDailyReminder(currentHour, nextMinute);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        await notificationService.scheduleDailyReminder(
          settings.notificationHour !== undefined ? settings.notificationHour : 20,
          settings.notificationMinute !== undefined ? settings.notificationMinute : 0
        );
      } else {
        setNotificationsEnabled(false);
        Alert.alert('Permission Denied', 'Please enable notifications in device settings.');
      }
    } else {
      await notificationService.cancelAllScheduledNotifications();
    }
  };

  const handleTestDailyReminder = async () => {
    try {
      await notificationService.sendTestDailyReminder();
    } catch {
      Alert.alert('Error', 'Failed to send test reminder notification.');
    }
  };

  const handleTestWarning = async () => {
    try {
      await notificationService.sendTestBudgetWarning(
        'Groceries',
        settings.budgetWarningThreshold || 80,
        expenseHelpers.getCurrencySymbol(settings.currency)
      );
    } catch {
      Alert.alert('Error', 'Failed to send test warning notification.');
    }
  };

  const handleTestExceeded = async () => {
    try {
      await notificationService.sendTestBudgetExceeded(
        'Dining Out',
        145.50,
        100.00,
        expenseHelpers.getCurrencySymbol(settings.currency)
      );
    } catch {
      Alert.alert('Error', 'Failed to send test exceeded notification.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header
        title="SETTINGS"
        showBackButton={true}
        onBackPress={() => router.back()}
        rightIcon="log-out"
        onRightPress={handleLogout}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        
        {/* Section: Account */}
        {user && (
          <>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MY ACCOUNT</Text>
            <Card style={styles.settingsCard}>
              <View style={styles.row}>
                <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
                  <Info size={20} color={colors.primary} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>Logged in as</Text>
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                    {user.email}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TouchableOpacity style={styles.row} onPress={handleLogout} activeOpacity={0.7}>
                <View style={[styles.rowIconBg, { backgroundColor: colors.danger + '20' }]}>
                  <LogOut size={20} color={colors.danger} />
                </View>
                <View style={styles.rowInfo}>
                  <Text style={[styles.rowLabel, { color: colors.danger }]}>Sign Out</Text>
                  <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                    Log out of your Supabase account
                  </Text>
                </View>
              </TouchableOpacity>
            </Card>
          </>
        )}

        {/* Section: Appearance */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.row} onPress={handleThemeChange} activeOpacity={0.7}>
            <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
              {theme === 'dark' ? (
                <Moon size={20} color={colors.primary} />
              ) : (
                <Sun size={20} color={colors.primary} />
              )}
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Dark Mode</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                {theme === 'dark' ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeChange}
              thumbColor={theme === 'dark' ? colors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
            />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.row} onPress={selectCurrency} activeOpacity={0.7}>
            <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
              <IndianRupee size={20} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Currency Symbol</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Current: {settings.currency}
              </Text>
            </View>
            <Globe size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Card>

        {/* Section: System Alerts */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>NOTIFICATIONS</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.row}>
            <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
              <Bell size={20} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Daily Reminders</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Remind me to log spending daily at {formatTime(settings.notificationHour || 20, settings.notificationMinute || 0)}
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              thumbColor={settings.notificationsEnabled ? colors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
            />
          </View>

          {settings.notificationsEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              {/* Centered Clock Style Time Picker */}
              <View style={styles.timeSection}>
                <Text style={[styles.nestedTitle, { color: colors.text }]}>Reminder Alert Schedule</Text>
                <Text style={[styles.apiKeyHelp, { color: colors.textSecondary, marginBottom: 12 }]}>
                  Configure the target hour and minutes to receive your daily check-in.
                </Text>
                
                <View style={[styles.clockCard, { backgroundColor: isDark ? '#1a2235' : '#F8FAFC', borderColor: colors.border }]}>
                  <View style={styles.clockDigitContainer}>
                    <TouchableOpacity 
                      onPress={() => handleAdjustHour(-1)} 
                      style={[styles.clockAdjustBtn, { backgroundColor: colors.primaryLight }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.clockAdjustText, { color: colors.primary }]}>-</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.digitBox}>
                      <Text style={[styles.clockDigit, { color: colors.text }]}>
                        {String(settings.notificationHour !== undefined ? (settings.notificationHour % 12 === 0 ? 12 : settings.notificationHour % 12) : 8).padStart(2, '0')}
                      </Text>
                      <Text style={[styles.digitLabel, { color: colors.textSecondary }]}>HOUR</Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => handleAdjustHour(1)} 
                      style={[styles.clockAdjustBtn, { backgroundColor: colors.primaryLight }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.clockAdjustText, { color: colors.primary }]}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.clockColon, { color: colors.textSecondary }]}>:</Text>

                  <View style={styles.clockDigitContainer}>
                    <TouchableOpacity 
                      onPress={() => handleAdjustMinute(-5)} 
                      style={[styles.clockAdjustBtn, { backgroundColor: colors.primaryLight }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.clockAdjustText, { color: colors.primary }]}>-</Text>
                    </TouchableOpacity>
                    
                    <View style={styles.digitBox}>
                      <Text style={[styles.clockDigit, { color: colors.text }]}>
                        {String(settings.notificationMinute !== undefined ? settings.notificationMinute : 0).padStart(2, '0')}
                      </Text>
                      <Text style={[styles.digitLabel, { color: colors.textSecondary }]}>MIN</Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => handleAdjustMinute(5)} 
                      style={[styles.clockAdjustBtn, { backgroundColor: colors.primaryLight }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.clockAdjustText, { color: colors.primary }]}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity 
                    onPress={() => handleAdjustHour(12)} 
                    style={[styles.ampmBtn, { backgroundColor: colors.primaryLight }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.ampmText, { color: colors.primary }]}>
                      {settings.notificationHour >= 12 ? 'PM' : 'AM'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              
              {/* Budget Warning Configuration with Symmetric Segmented Selector */}
              <View style={styles.nestedRowBlock}>
                <View style={styles.row}>
                  <View style={styles.rowInfo}>
                    <Text style={[styles.nestedTitle, { color: colors.text }]}>Budget Limit Warning</Text>
                    <Text style={[styles.apiKeyHelp, { color: colors.textSecondary }]}>
                      Get alerted when approaching your spending limits.
                    </Text>
                  </View>
                  <Switch
                    value={settings.budgetWarningEnabled}
                    onValueChange={setBudgetWarningEnabled}
                    thumbColor={settings.budgetWarningEnabled ? colors.primary : '#f4f3f4'}
                    trackColor={{ false: '#767577', true: colors.primaryLight }}
                  />
                </View>
                
                {settings.budgetWarningEnabled && (
                  <View style={[styles.segmentedContainer, { backgroundColor: isDark ? '#151d30' : '#F1F5F9' }]}>
                    {[50, 80, 90].map((val) => {
                      const isSelected = settings.budgetWarningThreshold === val;
                      return (
                        <TouchableOpacity
                          key={val}
                          onPress={() => setBudgetWarningThreshold(val)}
                          style={[
                            styles.segmentedItem,
                            isSelected && { backgroundColor: colors.primary }
                          ]}
                          activeOpacity={0.8}
                        >
                          <Text 
                            style={[
                              styles.segmentedText, 
                              { 
                                color: isSelected ? '#FFFFFF' : colors.textSecondary,
                                fontWeight: isSelected ? '800' : '600'
                              }
                            ]}
                          >
                            {val}% limit
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* Push Testing Control Room - Beautiful list items */}
              <View style={styles.nestedRowBlock}>
                <Text style={[styles.nestedTitle, { color: colors.text, marginBottom: 4 }]}>Notification Testing Center</Text>
                <Text style={[styles.apiKeyHelp, { color: colors.textSecondary, marginBottom: 12 }]}>
                  Test how spending alerts will render natively on your device.
                </Text>
                
                <View style={styles.testList}>
                  <TouchableOpacity 
                    onPress={handleTestDailyReminder} 
                    style={[styles.testListItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.testIconBg, { backgroundColor: colors.primaryLight }]}>
                      <Bell size={16} color={colors.primary} />
                    </View>
                    <Text style={[styles.testListText, { color: colors.text }]}>Send Mock Daily Reminder</Text>
                    <Text style={[styles.testListBadge, { color: colors.primary, backgroundColor: colors.primaryLight }]}>Test</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleTestWarning} 
                    style={[styles.testListItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.testIconBg, { backgroundColor: colors.warning + '20' }]}>
                      <AlertTriangle size={16} color={colors.warning} />
                    </View>
                    <Text style={[styles.testListText, { color: colors.text }]}>Send Budget Warning ({settings.budgetWarningThreshold || 80}%)</Text>
                    <Text style={[styles.testListBadge, { color: colors.warning, backgroundColor: colors.warning + '20' }]}>Test</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={handleTestExceeded} 
                    style={[styles.testListItem, { borderColor: colors.border, backgroundColor: colors.card }]}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.testIconBg, { backgroundColor: colors.danger + '20' }]}>
                      <AlertTriangle size={16} color={colors.danger} />
                    </View>
                    <Text style={[styles.testListText, { color: colors.text }]}>Send Budget Exceeded Alert</Text>
                    <Text style={[styles.testListBadge, { color: colors.danger, backgroundColor: colors.danger + '20' }]}>Test</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </Card>

        {/* Section: Data Operations */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DATA MANAGEMENT</Text>
        <Card style={styles.settingsCard}>
          <TouchableOpacity style={styles.row} onPress={handleExportCSV} activeOpacity={0.7}>
            <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
              <Download size={20} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Export CSV Report</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Generate table file format for Excel
              </Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.row} onPress={handleExportJSON} activeOpacity={0.7}>
            <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
              <Upload size={20} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Create Backup</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Export full JSON file payload database
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Section: System & Engines */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INTELLIGENCE ENGINE</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.row}>
            <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
              <Cpu size={20} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>AI Categorization</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Predict categories automatically after scan
              </Text>
            </View>
            <Switch
              value={settings.aiCategorizationEnabled}
              onValueChange={setAiCategorizationEnabled}
              thumbColor={settings.aiCategorizationEnabled ? colors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
              <Cpu size={20} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Cloud OCR Engine</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                Use Google Gemini API for actual receipt scanning
              </Text>
            </View>
            <Switch
              value={settings.ocrEngine === 'cloud'}
              onValueChange={(enabled) => setOcrEngine(enabled ? 'cloud' : 'mock')}
              thumbColor={settings.ocrEngine === 'cloud' ? colors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
            />
          </View>

          {settings.ocrEngine === 'cloud' && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.apiKeyContainer}>
                <Text style={[styles.apiKeyLabel, { color: colors.textSecondary }]}>GEMINI API KEY</Text>
                <TextInput
                  style={[styles.apiKeyInput, { color: colors.text, borderColor: colors.border }]}
                  value={settings.geminiApiKey}
                  onChangeText={setGeminiApiKey}
                  placeholder="Enter your Gemini API key..."
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={[styles.apiKeyHelp, { color: colors.textSecondary }]}>
                  This key is stored securely on your device. It enables extracting real data from receipts and invoices.
                </Text>
              </View>
            </>
          )}
        </Card>

        {/* Section: Version info */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPLICATION</Text>
        <Card style={styles.settingsCard}>
          <View style={styles.row}>
            <View style={[styles.rowIconBg, { backgroundColor: colors.primaryLight }]}>
              <IconRow icon={Info} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>Version</Text>
              <Text style={[styles.rowSub, { color: colors.textSecondary }]}>
                v1.0.0 (Production Build)
              </Text>
            </View>
          </View>
        </Card>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
    </View>
  );
}

// Inline Helper
const IconRow = ({ icon: Icon, color }: { icon: any; color: string }) => {
  return <Icon size={20} color={color} />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    paddingVertical: 4,
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowIconBg: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  rowSub: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  apiKeyContainer: {
    paddingVertical: 12,
  },
  apiKeyLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  apiKeyHelp: {
    fontSize: 10,
    marginTop: 6,
    lineHeight: 14,
  },
  nestedRowBlock: {
    paddingVertical: 14,
  },
  nestedTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeSection: {
    paddingVertical: 14,
  },
  clockCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  clockDigitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  clockAdjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockAdjustText: {
    fontSize: 18,
    fontWeight: '700',
  },
  digitBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
  },
  clockDigit: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  digitLabel: {
    fontSize: 8,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  clockColon: {
    fontSize: 26,
    fontWeight: '800',
    marginHorizontal: 12,
    bottom: 2,
  },
  ampmBtn: {
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 46,
  },
  ampmText: {
    fontSize: 12,
    fontWeight: '800',
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 4,
    marginTop: 10,
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  testList: {
    marginTop: 8,
    gap: 8,
  },
  testListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  testIconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  testListText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  testListBadge: {
    fontSize: 9,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
