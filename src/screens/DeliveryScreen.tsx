import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, Input } from '../components';
import { useUser } from '../context/UserContext';
import { notifyAdminOfOrder } from '../services/orderNotification';
import { saveOrder } from '../services/orderHistory';
import { simulateOrderProgression } from '../services/orderTracking';
import {
  getPointsBalance,
  creditPoints,
  deductPoints,
  calculateEarnedPoints,
  calculateMaxRedeemable,
} from '../services/pointsService';
import { getSavedAddress, saveAddress } from '../services/addressService';
import { colors, typography, spacing, shadows } from '../theme';
import { formatPrice } from '../utils/formatPrice';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Delivery'>;
  route: RouteProp<RootStackParamList, 'Delivery'>;
};

type CartJuice = { id: string; name: string; price: number };

export function DeliveryScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { name, email, phone, selectedJuices } = route.params;
  const [cartItems, setCartItems] = useState<CartJuice[]>(selectedJuices);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [pointsBalance, setPointsBalance] = useState(0);
  const [usePoints, setUsePoints] = useState(false);
  const [addressLoaded, setAddressLoaded] = useState(false);

  const loadUserData = useCallback(async () => {
    if (!user?.id) return;
    const [bal, savedAddr] = await Promise.all([
      getPointsBalance(user.id),
      getSavedAddress(user.id),
    ]);
    setPointsBalance(bal);
    if (savedAddr && !addressLoaded) {
      setAddress(savedAddr);
      setAddressLoaded(true);
    }
  }, [user?.id, addressLoaded]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const canProceed = address.trim().length > 0 && cartItems.length > 0;
  const subtotal = cartItems.reduce((sum, j) => sum + j.price, 0);
  const maxRedeemable = calculateMaxRedeemable(pointsBalance, subtotal);
  const discount = usePoints ? maxRedeemable : 0;
  const total = subtotal - discount;
  const pointsEarned = calculateEarnedPoints(total);

  const removeFromCart = (juiceId: string) => {
    setCartItems((prev) => prev.filter((j) => j.id !== juiceId));
  };

  const handlePlaceOrder = async () => {
    if (!canProceed) return;

    if (!user?.id) return;
    if (discount > 0) {
      await deductPoints(user.id, discount);
    }
    const newBalance = await creditPoints(user.id, pointsEarned);
    setPointsBalance(newBalance);

    saveAddress(user.id, address.trim());

    const orderId = `SJ-${Date.now().toString().slice(-8)}`;
    await notifyAdminOfOrder({
      orderId,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      items: cartItems.map((j) => ({ name: j.name, price: j.price })),
      total,
      address,
      notes,
    });
    await saveOrder({
      orderId,
      items: cartItems.map((j) => ({ id: j.id, name: j.name, price: j.price })),
      total,
      address,
      pointsEarned,
      pointsUsed: discount,
    });
    simulateOrderProgression(orderId);
    navigation.navigate('Feedback', {
      orderId,
      orderedJuices: cartItems.map((j) => ({ id: j.id, name: j.name })),
      pointsEarned,
      pointsUsed: discount,
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: Math.max(spacing.xxl, insets.bottom + spacing.lg),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Almost there</Text>
          <Text style={styles.headerSubtitle}>
            Where should we bring your fresh juice?
          </Text>
          <View style={styles.orderSummary}>
            <Text style={styles.summaryLabel}>YOUR ORDER</Text>
            {cartItems.length === 0 ? (
              <Text style={styles.emptyCart}>Cart is empty. Go back to add juices.</Text>
            ) : (
              cartItems.map((juice) => (
                <View key={juice.id} style={styles.cartItem}>
                  <View style={styles.cartItemContent}>
                    <Text style={styles.juiceName}>{juice.name}</Text>
                    <Text style={styles.juicePrice}>{formatPrice(juice.price)}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFromCart(juice.id)}
                    style={styles.removeIcon}
                    activeOpacity={0.6}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.removeIconText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
            {cartItems.length > 0 && (
              <>
                {discount > 0 && (
                  <View style={styles.subtotalRow}>
                    <Text style={styles.subtotalLabel}>Subtotal</Text>
                    <Text style={styles.subtotalPrice}>{formatPrice(subtotal)}</Text>
                  </View>
                )}
                {pointsBalance > 0 && (
                  <View style={styles.pointsToggleRow}>
                    <View style={styles.pointsToggleInfo}>
                      <Text style={styles.pointsToggleLabel}>
                        Use {maxRedeemable} pts
                      </Text>
                      <Text style={styles.pointsToggleSaving}>
                        Save {formatPrice(maxRedeemable)}
                      </Text>
                    </View>
                    <Switch
                      value={usePoints}
                      onValueChange={setUsePoints}
                      trackColor={{ false: colors.borderLight, true: colors.primaryLight }}
                      thumbColor={usePoints ? colors.primary : colors.textMuted}
                    />
                  </View>
                )}
                {discount > 0 && (
                  <View style={styles.discountRow}>
                    <Text style={styles.discountLabel}>Points discount</Text>
                    <Text style={styles.discountAmount}>-{formatPrice(discount)}</Text>
                  </View>
                )}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
                </View>
              </>
            )}
          </View>
          {pointsBalance > 0 && (
            <View style={styles.pointsBalanceBadge}>
              <Text style={styles.pointsBalanceText}>
                Your balance: {pointsBalance} reward pts
              </Text>
            </View>
          )}
        </View>

        <View style={styles.formCard}>
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
    borderRadius: 16,
    padding: spacing.base,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    ...shadows.card,
  },
  summaryLabel: {
    ...typography.captionBold,
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: colors.background,
    borderRadius: 10,
  },
  cartItemContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  emptyCart: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.sm,
  },
  removeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeIconText: {
    fontSize: 20,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 22,
  },
  juiceName: {
    ...typography.body,
    color: colors.text,
  },
  juicePrice: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm + 28 + spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  subtotalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  subtotalPrice: {
    ...typography.body,
    color: colors.textSecondary,
  },
  pointsToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.accentMuted,
    borderRadius: 10,
  },
  pointsToggleInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  pointsToggleLabel: {
    ...typography.bodyBold,
    color: colors.primaryDark,
  },
  pointsToggleSaving: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
  },
  discountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm + 28 + spacing.md,
    marginTop: spacing.xs,
  },
  discountLabel: {
    ...typography.body,
    color: colors.success,
  },
  discountAmount: {
    ...typography.bodyBold,
    color: colors.success,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    paddingLeft: spacing.sm,
    paddingRight: spacing.sm + 28 + spacing.md,
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
  pointsBalanceBadge: {
    marginTop: spacing.sm,
    alignSelf: 'flex-end',
  },
  pointsBalanceText: {
    ...typography.caption,
    color: colors.primary,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  addressInput: {
    height: 88,
    textAlignVertical: 'top',
    paddingTop: spacing.base,
  },
});
