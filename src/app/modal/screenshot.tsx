import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ocrService, OcrResult } from '../../services/ocrService';
import { useExpenseStore } from '../../store/expenseStore';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../../components/Card';
import { Image as ImageIcon, Check, RefreshCw, Smartphone } from 'lucide-react-native';

export default function ScreenshotModal() {
  const router = useRouter();
  const { colors } = useTheme();
  const { addExpense } = useExpenseStore();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<OcrResult | null>(null);

  const pickScreenshot = async (presetName?: string) => {
    try {
      setIsScanning(true);
      let uri = 'mock_upi_screenshot.png';

      if (!presetName) {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Cooperation needed to access gallery.');
          setIsScanning(false);
          return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

        if (pickerResult.canceled || pickerResult.assets.length === 0) {
          setIsScanning(false);
          return;
        }

        uri = pickerResult.assets[0].uri;
      } else {
        uri = `mock_${presetName}_screenshot.png`;
      }

      setImageUri(uri);

      // Perform transaction scan
      const detectedPreset = presetName || 'gpay_upi';
      const ocrResult = await ocrService.extractReceipt(uri, detectedPreset);

      setResult(ocrResult);
      setIsScanning(false);
    } catch (e: any) {
      console.error(e);
      Alert.alert('Scan Failed', e.message || 'Unable to parse screenshot details.');
      setIsScanning(false);
      setImageUri(null);
      setResult(null);
    }
  };

  const handleConfirm = () => {
    if (!result) return;

    addExpense({
      id: `exp_${Date.now()}`,
      amount: result.amount,
      merchant: result.merchant,
      category: 'Other', // default, user can edit in transactions
      date: result.date,
      time: result.time,
      paymentMethod: result.paymentMethod,
      currency: result.currency,
      tax: 0,
      notes: `Extracted from screenshot. Txn ID: ${result.transactionId || 'N/A'}`,
      receiptImage: imageUri || undefined,
    });

    Alert.alert('Success', 'Screenshot payment logged successfully!');
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {!imageUri && !isScanning ? (
        <View style={styles.pickerBox}>
          <Smartphone size={64} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text, marginTop: 16 }]}>UPI Payment Screen</Text>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Import screenshots from Google Pay, PhonePe, Paytm or bank apps to extract transaction values instantly.
          </Text>

          <TouchableOpacity
            style={[styles.pickerBtn, { backgroundColor: colors.primary }]}
            onPress={() => pickScreenshot()}
          >
            <ImageIcon size={20} color="#FFF" style={{ marginRight: 8 }} />
            <Text style={styles.pickerBtnText}>Select Screenshot</Text>
          </TouchableOpacity>

          {/* Preset Demos */}
          <Text style={[styles.demoLabel, { color: colors.textSecondary }]}>CHOOSE PRESET SCREEN (MOCK)</Text>
          <View style={styles.demoRow}>
            {['gpay_upi', 'phonepe_upi', 'paytm_upi'].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[styles.demoBtn, { borderColor: colors.border }]}
                onPress={() => pickScreenshot(preset)}
              >
                <Text style={[styles.demoText, { color: colors.text }]}>
                  {preset.split('_')[0].toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : isScanning ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Analyzing Screenshot pixels...</Text>
          <Text style={[styles.loadingSub, { color: colors.textSecondary }]}>Extracting Transaction IDs and UPI details...</Text>
        </View>
      ) : (
        result && (
          <View style={styles.confirmBox}>
            <Text style={[styles.confirmHeading, { color: colors.text }]}>Add this expense?</Text>
            <Text style={[styles.confirmSub, { color: colors.textSecondary }]}>
              We parsed the following details from your payment screenshot:
            </Text>

            <Card style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount</Text>
                <Text style={[styles.detailVal, { color: colors.text, fontSize: 24, fontWeight: '800' }]}>
                  {result.currency === 'INR' ? '₹' : '$'}
                  {result.amount.toFixed(2)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Receiver / Merchant</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{result.merchant}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Date & Time</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>
                  {result.date} @ {result.time}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Transaction ID</Text>
                <Text style={[styles.detailVal, { color: colors.text, fontSize: 11 }]}>
                  {result.transactionId || 'N/A'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Payment Method</Text>
                <Text style={[styles.detailVal, { color: colors.text }]}>{result.paymentMethod}</Text>
              </View>
            </Card>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.rescanBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setImageUri(null);
                  setResult(null);
                }}
              >
                <RefreshCw size={16} color={colors.text} style={{ marginRight: 6 }} />
                <Text style={[styles.rescanBtnText, { color: colors.text }]}>Discard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleConfirm}
              >
                <Check size={16} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.saveBtnText}>Add Expense</Text>
              </TouchableOpacity>
            </View>
          </View>
        )
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pickerBox: {
    alignItems: 'center',
    padding: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 24,
  },
  pickerBtn: {
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  pickerBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  demoLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 40,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  demoText: {
    fontSize: 11,
    fontWeight: '700',
  },
  loadingBox: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 16,
  },
  loadingSub: {
    fontSize: 12,
    marginTop: 4,
  },
  confirmBox: {
    padding: 16,
  },
  confirmHeading: {
    fontSize: 20,
    fontWeight: '700',
  },
  confirmSub: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  detailsCard: {
    padding: 16,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  rescanBtn: {
    flex: 1,
    borderWidth: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescanBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
