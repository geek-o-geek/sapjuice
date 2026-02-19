import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, Input, StepIndicator } from '../components';
import { notifyAdminOfOrder } from '../services/orderNotification';
import { colors, typography, spacing, shadows } from '../theme';
import { formatPrice } from '../utils/formatPrice';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Delivery'>;
  route: RouteProp<RootStackParamList, 'Delivery'>;
};

export function DeliveryScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { name, email, phone, selectedJuices } = route.params;
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const canProceed = address.trim().length > 0;
  const total = selectedJuices.reduce((sum, j) => sum + j.price, 0);

  const handlePlaceOrder = async () => {
    if (!canProceed) return;

    const orderId = `SJ-${Date.now().toString().slice(-8)}`;
    await notifyAdminOfOrder({
      orderId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      items: selectedJuices.map((j) => ({ name: j.name, price: j.price })),
      total,
      address,
      notes,
    });
    navigation.navigate('Feedback', { orderId });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(spacing.base, insets.top) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator
          currentStep={3}
          totalSteps={4}
          stepLabels={['Account', 'Juice', 'Delivery', 'Confirmed']}
        />

        <View style={styles.header}>
          <Text style={styles.title}>Almost there</Text>
          <Text style={styles.headerSubtitle}>
            Where should we bring your fresh juice?
          </Text>
          <View style={styles.orderSummary}>
            <Text style={styles.summaryLabel}>In your cart</Text>
            {selectedJuices.map((juice) => (
              <View key={juice.id} style={styles.orderRow}>
                <Text style={styles.juiceName}>{juice.name}</Text>
                <Text style={styles.juicePrice}>{formatPrice(juice.price)}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>
                {formatPrice(selectedJuices.reduce((sum, j) => sum + j.price, 0))}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.form}>
          <Input
            label="Delivery address"
            placeholder="123 Main St, City, ZIP"
            value={address}
            onChangeText={setAddress}
            multiline
            style={styles.addressInput}
          />
          <Input
            label="Delivery notes"
            placeholder="Apt #, buzzer, gate code, special instructions..."
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <Button
          title="Place order"
          onPress={handlePlaceOrder}
          disabled={!canProceed}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.base,
  },
  orderSummary: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.card,
  },
  summaryLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  juiceName: {
    ...typography.body,
    color: colors.text,
  },
  juicePrice: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  totalLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  totalPrice: {
    ...typography.h3,
    color: colors.primary,
  },
  form: {
    marginBottom: spacing.lg,
  },
  addressInput: {
    height: 88,
    textAlignVertical: 'top',
    paddingTop: spacing.base,
  },
});
