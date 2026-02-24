import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, StarRating } from '../components';
import { useUser } from '../context/UserContext';
import { addReview } from '../services/reviewStorage';
import { colors, typography, spacing, shadows } from '../theme';
import { formatPrice } from '../utils/formatPrice';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Feedback'>;
  route: RouteProp<RootStackParamList, 'Feedback'>;
};

type JuiceReviewDraft = {
  juiceId: string;
  juiceName: string;
  tasteRating: number;
  qualityRating: number;
  comment: string;
};

export function FeedbackScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { orderId, orderedJuices, pointsEarned, pointsUsed } = route.params;

  const [submitted, setSubmitted] = useState(false);
  const [drafts, setDrafts] = useState<JuiceReviewDraft[]>(
    (orderedJuices ?? []).map((j) => ({
      juiceId: j.id,
      juiceName: j.name,
      tasteRating: 0,
      qualityRating: 0,
      comment: '',
    })),
  );

  const updateDraft = (index: number, field: keyof JuiceReviewDraft, value: string | number) => {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  };

  const hasAnyRating = drafts.some((d) => d.tasteRating > 0 || d.qualityRating > 0);

  const handleSubmitReviews = async () => {
    const rated = drafts.filter((d) => d.tasteRating > 0 && d.qualityRating > 0);
    if (rated.length === 0) {
      Toast.show({ type: 'info', text1: 'Rate at least one juice', text2: 'Please give both taste and quality ratings for at least one juice.' });
      return;
    }
    const userName = user?.name ?? 'Anonymous';
    for (const d of rated) {
      await addReview({
        juiceId: d.juiceId,
        userName: userName.split(' ')[0] + ' ' + (userName.split(' ')[1]?.[0] ?? '').toUpperCase() + '.',
        tasteRating: d.tasteRating,
        qualityRating: d.qualityRating,
        comment: d.comment,
      });
    }
    setSubmitted(true);
  };

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.successCard}>
          <LottieView
            source={require('../assets/lottie/success.json')}
            autoPlay
            loop={false}
            style={styles.successLottie}
          />
          <Text style={styles.title}>Order placed!</Text>
          <Text style={styles.orderIdBadge}>{orderId}</Text>
        </View>

        {(pointsEarned ?? 0) > 0 && (
          <View style={styles.rewardBanner}>
            <Text style={styles.rewardTitle}>+{pointsEarned} reward points earned!</Text>
            {(pointsUsed ?? 0) > 0 && (
              <Text style={styles.rewardSub}>
                You saved {formatPrice(pointsUsed!)} with points on this order.
              </Text>
            )}
            <Text style={styles.rewardHint}>
              Use your points for discounts on future orders.
            </Text>
          </View>
        )}

        <Text style={styles.message}>
          Your order has been confirmed and will be delivered soon.
        </Text>

        <View style={styles.trackButtonWrap}>
          <Button
            title="Track your order"
            onPress={() => navigation.navigate('OrderTracking', { orderId })}
            variant="secondary"
          />
        </View>

        {orderedJuices && orderedJuices.length > 0 && !submitted && (
          <View style={styles.reviewSection}>
            <Text style={styles.reviewHeading}>Rate your juices</Text>
            <Text style={styles.reviewSubheading}>
              Your feedback helps other customers choose the best juice.
            </Text>
            {drafts.map((draft, index) => (
              <View key={draft.juiceId} style={styles.reviewCard}>
                <Text style={styles.reviewJuiceName}>{draft.juiceName}</Text>
                <View style={styles.ratingRow}>
                  <StarRating
                    rating={draft.tasteRating}
                    size={24}
                    interactive
                    onRate={(r) => updateDraft(index, 'tasteRating', r)}
                    label="Taste"
                  />
                </View>
                <View style={styles.ratingRow}>
                  <StarRating
                    rating={draft.qualityRating}
                    size={24}
                    interactive
                    onRate={(r) => updateDraft(index, 'qualityRating', r)}
                    label="Quality"
                  />
                </View>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Share your thoughts (optional)"
                  placeholderTextColor={colors.textMuted}
                  value={draft.comment}
                  onChangeText={(t) => updateDraft(index, 'comment', t)}
                  multiline
                  maxLength={200}
                />
              </View>
            ))}
            <Button
              title="Submit review"
              onPress={handleSubmitReviews}
              disabled={!hasAnyRating}
              variant="secondary"
            />
          </View>
        )}

        {submitted && (
          <View style={styles.thankYouCard}>
            <Text style={styles.thankYouText}>Thanks for your review!</Text>
            <Text style={styles.thankYouSub}>
              Your feedback will help others pick their perfect juice.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.sm) }]}>
        <Button title="Place another order" onPress={handleNewOrder} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  successCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  successLottie: {
    width: 80,
    height: 80,
    marginBottom: spacing.base,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  orderIdBadge: {
    ...typography.label,
    color: colors.primary,
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rewardBanner: {
    backgroundColor: colors.accentMuted,
    borderRadius: 14,
    padding: spacing.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
  },
  rewardTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  rewardSub: {
    ...typography.caption,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  rewardHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  trackButtonWrap: {
    marginBottom: spacing.lg,
  },
  reviewSection: {
    marginBottom: spacing.lg,
  },
  reviewHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  reviewSubheading: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.base,
    lineHeight: 18,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  reviewJuiceName: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ratingRow: {
    marginBottom: spacing.sm,
  },
  commentInput: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.background,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  thankYouCard: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 14,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  thankYouText: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    marginBottom: spacing.xs,
  },
  thankYouSub: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
});
