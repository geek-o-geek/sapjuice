import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TestimonialCard } from '../components';
import { getAllReviews, averageRating, type Review } from '../services/reviewStorage';
import { StarRating } from '../components/StarRating';
import { juices } from '../data/juices';
import { colors, typography, spacing, shadows } from '../theme';

const juiceNameMap = new Map(juices.map((j) => [j.id, j.name]));

export function ReviewsScreen() {
  const insets = useSafeAreaInsets();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReviews = useCallback(async () => {
    const data = await getAllReviews();
    setReviews(data);
  }, []);

  useEffect(() => {
    loadReviews().finally(() => setLoading(false));
  }, [loadReviews]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  }, [loadReviews]);

  const avg = averageRating(reviews);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: Math.max(spacing.lg, insets.bottom) }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryAvg}>{avg > 0 ? avg.toFixed(1) : '—'}</Text>
        <StarRating rating={avg} size={22} />
        <Text style={styles.summaryCount}>
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </Text>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No reviews yet</Text>
          <Text style={styles.emptyMessage}>
            Reviews will appear here after customers share their experience.
          </Text>
        </View>
      ) : (
        reviews.map((review) => (
          <TestimonialCard
            key={review.id}
            review={review}
            juiceName={juiceNameMap.get(review.juiceId)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  summaryAvg: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  summaryCount: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
