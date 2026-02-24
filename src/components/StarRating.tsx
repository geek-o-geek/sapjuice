import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';

type StarRatingProps = {
  rating: number;
  size?: number;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  label?: string;
};

export function StarRating({
  rating,
  size = 20,
  interactive = false,
  onRate,
  label,
}: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.starsRow}>
        {stars.map((star) => {
          const filled = star <= Math.round(rating);
          const starElement = (
            <Text
              key={star}
              style={[
                styles.star,
                { fontSize: size, lineHeight: size + 4 },
                filled ? styles.starFilled : styles.starEmpty,
              ]}
            >
              ★
            </Text>
          );

          if (interactive && onRate) {
            return (
              <TouchableOpacity
                key={star}
                onPress={() => onRate(star)}
                activeOpacity={0.6}
                hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
              >
                {starElement}
              </TouchableOpacity>
            );
          }
          return starElement;
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  star: {
    textAlign: 'center',
  },
  starFilled: {
    color: '#F59E0B',
  },
  starEmpty: {
    color: colors.border,
  },
});
