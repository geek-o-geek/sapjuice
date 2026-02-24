import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Button } from '../components';
import { useUser } from '../context/UserContext';
import {
  getOrderStatus,
  subscribeToOrder,
  ORDER_STATUSES,
  STATUS_LABELS,
  STATUS_DESCRIPTIONS,
  PROGRESSION_DELAYS_MS,
  type OrderStatus,
} from '../services/orderTracking';
import { supabase } from '../config/supabase';
import { colors, typography, spacing, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'OrderTracking'>;
  route: RouteProp<RootStackParamList, 'OrderTracking'>;
};

export function OrderTrackingScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { orderId } = route.params;
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const unsubRef = useRef<(() => void) | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let mounted = true;

    getOrderStatus(orderId).then((result) => {
      if (!mounted) return;
      const initial = result?.status ?? 'placed';
      setStatus(initial);
      setLoading(false);
      scheduleProgression(initial);
    }).catch(() => {
      if (!mounted) return;
      setStatus('placed');
      setLoading(false);
      scheduleProgression('placed');
    });

    unsubRef.current = subscribeToOrder(orderId, (newStatus) => {
      if (mounted) setStatus(newStatus);
    });

    function scheduleProgression(fromStatus: OrderStatus) {
      if (fromStatus !== 'placed') return;

      const timer = setTimeout(() => {
        if (!mounted) return;
        setStatus('preparing');
        supabase
          .from('orders')
          .update({ status: 'preparing' })
          .eq('order_id', orderId)
          .then(() => {});
      }, PROGRESSION_DELAYS_MS.placed ?? 8_000);

      timersRef.current.push(timer);
    }

    return () => {
      mounted = false;
      unsubRef.current?.();
      timersRef.current.forEach(clearTimeout);
    };
  }, [orderId]);

  const currentIndex = status ? ORDER_STATUSES.indexOf(status) : -1;
  const isDelivered = status === 'delivered';

  const handleBackToMenu = () => {
    if (user) {
      navigation.reset({
        index: 0,
        routes: [
          { name: 'SelectJuice', params: { name: user.name, email: user.email, phone: user.phone } },
        ],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Register' }],
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: Math.max(spacing.lg, insets.bottom) }]}>
      <View style={styles.headerCard}>
        <Text style={styles.orderLabel}>Order</Text>
        <Text style={styles.orderIdText}>{orderId}</Text>
        {status && (
          <View style={[styles.statusBadge, isDelivered && styles.statusBadgeDelivered]}>
            <Text style={[styles.statusBadgeText, isDelivered && styles.statusBadgeTextDelivered]}>
              {STATUS_LABELS[status]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.trackerCard}>
        {ORDER_STATUSES.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const isLast = index === ORDER_STATUSES.length - 1;

          return (
            <View key={step} style={styles.stepRow}>
              <View style={styles.stepIndicatorCol}>
                <View
                  style={[
                    styles.stepDot,
                    isCompleted && styles.stepDotCompleted,
                    isCurrent && styles.stepDotCurrent,
                  ]}
                >
                  {isCompleted && <Text style={styles.stepCheck}>✓</Text>}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.stepLine,
                      isCompleted && index < currentIndex && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isCurrent && styles.stepLabelCurrent,
                  ]}
                >
                  {STATUS_LABELS[step]}
                </Text>
                <Text style={styles.stepDescription}>
                  {STATUS_DESCRIPTIONS[step]}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {isDelivered && (
        <View style={styles.deliveredBanner}>
          <Text style={styles.deliveredTitle}>Order delivered!</Text>
          <Text style={styles.deliveredSub}>
            Thank you for ordering with SapJuice. Enjoy your fresh juice!
          </Text>
        </View>
      )}

      <View style={styles.footer}>
        <Button
          title={isDelivered ? 'Order more juice' : 'Back to menu'}
          onPress={handleBackToMenu}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  orderLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  orderIdText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  statusBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  statusBadgeDelivered: {
    backgroundColor: colors.success,
  },
  statusBadgeText: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  statusBadgeTextDelivered: {
    color: '#FFFFFF',
  },
  trackerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  stepRow: {
    flexDirection: 'row',
    minHeight: 72,
  },
  stepIndicatorCol: {
    width: 36,
    alignItems: 'center',
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  stepDotCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  stepCheck: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },
  stepLineCompleted: {
    backgroundColor: colors.primary,
  },
  stepContent: {
    flex: 1,
    marginLeft: spacing.md,
    paddingBottom: spacing.base,
  },
  stepLabel: {
    ...typography.body,
    color: colors.textMuted,
  },
  stepLabelCompleted: {
    color: colors.text,
    fontWeight: '600',
  },
  stepLabelCurrent: {
    color: colors.primary,
    fontWeight: '700',
  },
  stepDescription: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  deliveredBanner: {
    backgroundColor: colors.accentMuted,
    borderRadius: 14,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  deliveredTitle: {
    ...typography.h3,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  deliveredSub: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    marginTop: 'auto',
  },
});
