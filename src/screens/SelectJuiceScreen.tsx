import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, JuiceImage, StarRating, TestimonialCard } from '../components';
import { formatPrice } from '../utils/formatPrice';
import { colors, shadows, typography, spacing } from '../theme';
import { juices, type Juice } from '../data/juices';
import { getAllReviews, averageRating, type Review } from '../services/reviewStorage';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'SelectJuice'>;
  route: RouteProp<RootStackParamList, 'SelectJuice'>;
};

export function SelectJuiceScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { name, email, phone } = route.params;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [reviews, setReviews] = useState<Review[]>([]);

  const loadReviews = useCallback(async () => {
    const all = await getAllReviews();
    setReviews(all);
  }, []);

  useEffect(() => {
    loadReviews();
    const unsubscribe = navigation.addListener('focus', loadReviews);
    return unsubscribe;
  }, [loadReviews, navigation]);

  const reviewsByJuice = juices.reduce<Record<string, Review[]>>((acc, j) => {
    acc[j.id] = reviews.filter((r) => r.juiceId === j.id);
    return acc;
  }, {});

  const recentTestimonials = reviews.slice(0, 4);

  const juiceNameMap = juices.reduce<Record<string, string>>((acc, j) => {
    acc[j.id] = j.name;
    return acc;
  }, {});

  const toggleJuice = (juice: Juice) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(juice.id)) {
        next.delete(juice.id);
      } else {
        next.add(juice.id);
      }
      return next;
    });
  };

  const selectedJuices = juices.filter((j) => selectedIds.has(j.id));
  const total = selectedJuices.reduce((sum, j) => sum + j.price, 0);

  const handleContinue = () => {
    if (selectedJuices.length > 0) {
      navigation.navigate('Delivery', {
        name,
        email,
        phone,
        selectedJuices: selectedJuices.map((j) => ({
          id: j.id,
          name: j.name,
          price: j.price,
        })),
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgLayer} pointerEvents="none">
        <View style={[styles.bgBlob, styles.bgBlob1]} />
        <View style={[styles.bgBlob, styles.bgBlob2]} />
        <View style={[styles.bgBlob, styles.bgBlob3]} />
        <View style={[styles.bgBlob, styles.bgBlob4]} />
        <View style={[styles.bgBlob, styles.bgBlob5]} />
      </View>
      <View style={styles.header}>
        {/* <View style={styles.lottieWrap}>
          <LottieView
            source={require('../assets/lottie/juice.json')}
            autoPlay
            loop
            style={styles.lottie}
          />
        </View> */}
        <Text style={styles.greeting}>Welcome back, {name}</Text>
        <Text style={styles.title}>What'll it be today?</Text>
        <Text style={styles.subtitle}>
          Cold-pressed to lock in flavor and nutrients. Tap to add.
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {juices.map((juice) => {
          const isSelected = selectedIds.has(juice.id);
          const juiceReviews = reviewsByJuice[juice.id] ?? [];
          const avg = averageRating(juiceReviews);
          return (
            <TouchableOpacity
              key={juice.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggleJuice(juice)}
              activeOpacity={0.75}
            >
              <JuiceImage uri={juice.imageUri} emoji={juice.emoji} size={76} />
              <View style={styles.cardContent}>
                <Text style={styles.juiceName}>{juice.name}</Text>
                {juiceReviews.length > 0 && (
                  <View style={styles.cardRating}>
                    <StarRating rating={avg} size={12} />
                    <Text style={styles.ratingCount}>
                      {avg.toFixed(1)} ({juiceReviews.length})
                    </Text>
                  </View>
                )}
                <Text style={styles.juiceTagline}>{juice.tagline}</Text>
                <Text style={styles.juiceDesc}>{juice.description}</Text>
                <Text style={styles.price}>{formatPrice(juice.price)}</Text>
              </View>
              <View style={styles.selectionControl}>
                <View
                  style={[
                    styles.selectionIcon,
                    isSelected ? styles.selectionIconSelected : styles.selectionIconIdle,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectionIconText,
                      isSelected ? styles.selectionIconTextSelected : styles.selectionIconTextIdle,
                    ]}
                  >
                    {isSelected ? '✓' : '+'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.selectionLabel,
                    isSelected ? styles.selectionLabelSelected : styles.selectionLabelIdle,
                  ]}
                >
                  {isSelected ? 'Added' : 'Add'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {recentTestimonials.length > 0 && (
          <View style={styles.testimonialsSection}>
            <Text style={styles.testimonialsHeading}>What customers say</Text>
            {recentTestimonials.map((review) => (
              <TestimonialCard
                key={review.id}
                review={review}
                juiceName={juiceNameMap[review.juiceId]}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(spacing.lg, insets.bottom + spacing.sm) }]}>
        {selectedJuices.length > 0 && (
          <Text style={styles.cartSummary}>
            {selectedJuices.length} item{selectedJuices.length > 1 ? 's' : ''} · {formatPrice(total)}
          </Text>
        )}
        <Button
          title={
            selectedJuices.length > 0
              ? `Continue — ${selectedJuices.length} item${selectedJuices.length > 1 ? 's' : ''}`
              : 'Select juices'
          }
          onPress={handleContinue}
          disabled={selectedJuices.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgBlob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.35,
  },
  bgBlob1: {
    width: 280,
    height: 280,
    backgroundColor: colors.primary,
    top: -80,
    right: -100,
  },
  bgBlob2: {
    width: 200,
    height: 200,
    backgroundColor: colors.primaryLight,
    top: 120,
    left: -60,
    opacity: 0.4,
  },
  bgBlob3: {
    width: 160,
    height: 160,
    backgroundColor: colors.secondarySoft,
    bottom: 200,
    right: -40,
    opacity: 0.5,
  },
  bgBlob4: {
    width: 100,
    height: 100,
    backgroundColor: colors.primaryLight,
    bottom: 350,
    left: 20,
    opacity: 0.3,
  },
  bgBlob5: {
    width: 180,
    height: 180,
    backgroundColor: colors.accent,
    bottom: -60,
    left: -50,
    opacity: 0.45,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },
  lottieWrap: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  lottie: {
    width: 100,
    height: 100,
  },
  greeting: {
    ...typography.label,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
  },
  cartSummary: {
    ...typography.captionBold,
    color: colors.primary,
    marginBottom: spacing.sm,
    alignSelf: 'center',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: 130,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
    ...shadows.md,
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.base,
    marginRight: spacing.sm,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  ratingCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  juiceName: {
    ...typography.h3,
    color: colors.text,
  },
  juiceTagline: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 3,
  },
  juiceDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  price: {
    ...typography.bodyBold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  selectionControl: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  selectionIconSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  selectionIconIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  selectionIconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  selectionIconTextSelected: {
    color: '#FFFFFF',
  },
  selectionIconTextIdle: {
    color: colors.textMuted,
  },
  selectionLabel: {
    ...typography.captionBold,
    marginTop: 4,
  },
  selectionLabelSelected: {
    color: colors.primary,
  },
  selectionLabelIdle: {
    color: colors.textMuted,
  },
  testimonialsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  testimonialsHeading: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.base,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.base,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    ...shadows.lg,
  },
});
