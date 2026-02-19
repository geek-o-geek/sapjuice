import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, StepIndicator } from '../components';
import { useUser } from '../context/UserContext';
import { colors, typography, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Feedback'>;
  route: RouteProp<RootStackParamList, 'Feedback'>;
};

export function FeedbackScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { orderId } = route.params;

  const handleNewOrder = () => {
    if (user) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'SelectJuice',
            params: { name: user.name, email: user.email, phone: user.phone },
          },
        ],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Register' }],
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.content, { paddingTop: Math.max(spacing.xxl, insets.top + spacing.xl) }]}>
        <StepIndicator
          currentStep={4}
          totalSteps={4}
          stepLabels={['Account', 'Juice', 'Delivery', 'Confirmed']}
        />
        <Text style={styles.orderId}>Order {orderId}</Text>
        <Text style={styles.title}>Order placed</Text>
        <Text style={styles.message}>
          Your order has been confirmed and will be delivered soon. Delivery may take some time depending on your location.
        </Text>
        <Text style={styles.feedbackNote}>
          You can provide feedback after your delivery to help us improve.
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: Math.max(spacing.lg, insets.bottom) }]}>
        <Button title="Place another order" onPress={handleNewOrder} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  orderId: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.base,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  feedbackNote: {
    ...typography.caption,
    color: colors.textMuted,
  },
  footer: {
    padding: spacing.lg,
  },
});
