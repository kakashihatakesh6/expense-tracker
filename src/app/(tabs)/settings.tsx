import React from 'react';
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
import { useSettingsStore } from '../../store/settingsStore';
import { useExpenseStore } from '../../store/expenseStore';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/Card';
import { exportService } from '../../services/exportService';
import { notificationService } from '../../services/notificationService';
import {
  Moon,
  Sun,
  Globe,
  Bell,
  Download,
  Upload,
  Cpu,
  Info,
  DollarSign,
  LogOut,
} from 'lucide-react-native';

export default function SettingsScreen() {
  const { colors, theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);
  
  const { settings, setTheme, setCurrency, setNotificationsEnabled, setAiCategorizationEnabled, setOcrEngine, setGeminiApiKey } =
    useSettingsStore();
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

  const handleToggleNotifications = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    if (enabled) {
      const granted = await notificationService.requestPermissions();
      if (granted) {
        await notificationService.scheduleDailyReminder(20, 0); // 8 PM
      } else {
        setNotificationsEnabled(false);
        Alert.alert('Permission Denied', 'Please enable notifications in device settings.');
      }
    } else {
      await notificationService.cancelAllScheduledNotifications();
    }
  };

  return (
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
              <DollarSign size={20} color={colors.primary} />
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
                Remind me at 8:00 PM to log spending
              </Text>
            </View>
            <Switch
              value={settings.notificationsEnabled}
              onValueChange={handleToggleNotifications}
              thumbColor={settings.notificationsEnabled ? colors.primary : '#f4f3f4'}
              trackColor={{ false: '#767577', true: colors.primaryLight }}
            />
          </View>
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
});
