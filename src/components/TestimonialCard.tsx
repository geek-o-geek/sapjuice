import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, shadows } from '../theme';
import { StarRating } from './StarRating';
import type { Review } from '../services/reviewStorage';

type TestimonialCardProps = {
  review: Review;
  juiceName?: string;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function TestimonialCard({ review, juiceName }: TestimonialCardProps) {
  const avg = (review.tasteRating + review.qualityRating) / 2;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{review.userName.charAt(0)}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{review.userName}</Text>
          <Text style={styles.time}>{timeAgo(review.createdAt)}</Text>
        </View>
        <StarRating rating={avg} size={14} />
      </View>
      <Text style={styles.comment} numberOfLines={3}>{review.comment}</Text>
      {juiceName && <Text style={styles.juiceLabel}>{juiceName}</Text>}
      <View style={styles.ratingDetails}>
        <Text style={styles.ratingTag}>Taste {review.tasteRating}/5</Text>
        <Text style={styles.ratingTag}>Quality {review.qualityRating}/5</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.base,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    ...typography.bodyBold,
    color: colors.primaryDark,
    fontSize: 15,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    ...typography.label,
    color: colors.text,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  comment: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  juiceLabel: {
    ...typography.captionBold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  ratingDetails: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ratingTag: {
    ...typography.caption,
    color: colors.textMuted,
    backgroundColor: colors.borderLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
});
