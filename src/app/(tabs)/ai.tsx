import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../hooks/useTheme';
import { Scan, Image as ImageIcon, Sparkles, Cpu, Lightbulb } from 'lucide-react-native';

export default function AiHubScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight }]}>
          <Sparkles size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>AI Smart Hub</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Supercharge your accounting using advanced OCR scanners and predictive engines.
        </Text>
      </View>

      <View style={styles.deck}>
        {/* Action 1: Scan Receipt */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/modal/scan')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
            <Scan size={24} color={colors.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Scan Paper Receipt</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
              Capture a photo of any receipt. AI extracts items, amounts, merchant and category instantly.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Action 2: Import UPI */}
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.push('/modal/screenshot')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIconBg, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
            <ImageIcon size={24} color="#34D399" />
          </View>
          <View style={styles.actionContent}>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Import UPI Screenshot</Text>
            <Text style={[styles.actionDesc, { color: colors.textSecondary }]}>
              Upload a payment screen from Google Pay, PhonePe or Paytm to log transactions automatically.
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Feature capabilities info */}
      <View style={[styles.infoSection, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.infoHeading, { color: colors.text }]}>How it works</Text>
        
        <View style={styles.infoRow}>
          <Cpu size={16} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={styles.infoTextCol}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Local & Cloud OCR Engine</Text>
            <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
              Processes pixel layouts to recognize values. Configured to run locally or use Gemini AI.
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Lightbulb size={16} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={styles.infoTextCol}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>AI Category Classifier</Text>
            <Text style={[styles.infoDesc, { color: colors.textSecondary }]}>
              Automatically maps merchant names to spending categories like Food, Entertainment or Grocery.
            </Text>
          </View>
        </View>
      </View>
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    marginTop: 10,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  deck: {
    paddingHorizontal: 16,
    gap: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    marginTop: 24,
  },
  infoHeading: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoTextCol: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoDesc: {
    fontSize: 11.5,
    lineHeight: 16,
  },
});
