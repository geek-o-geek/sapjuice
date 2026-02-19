import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, StepIndicator, JuiceImage } from '../components';
import { formatPrice } from '../utils/formatPrice';
import { colors, shadows, typography, spacing } from '../theme';
import { juices, type Juice } from '../data/juices';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'SelectJuice'>;
  route: RouteProp<RootStackParamList, 'SelectJuice'>;
};

export function SelectJuiceScreen({ navigation, route }: Props) {
  const { name, email, phone } = route.params;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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
      <View style={styles.header}>
        <StepIndicator
          currentStep={2}
          totalSteps={4}
          stepLabels={['Account', 'Juice', 'Delivery', 'Confirmed']}
        />
        <Text style={styles.greeting}>Welcome back, {name}</Text>
        <Text style={styles.title}>What'll it be today?</Text>
        <Text style={styles.subtitle}>
          Each bottle is cold-pressed to lock in flavor and nutrients. Select one or more to add to your order.
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {juices.map((juice) => {
          const isSelected = selectedIds.has(juice.id);
          return (
            <TouchableOpacity
              key={juice.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggleJuice(juice)}
              activeOpacity={0.7}
            >
              <JuiceImage uri={juice.imageUri} emoji={juice.emoji} size={72} />
              <View style={styles.cardContent}>
                <Text style={styles.juiceName}>{juice.name}</Text>
                <Text style={styles.juiceTagline}>{juice.tagline}</Text>
                <Text style={styles.juiceDesc}>{juice.description}</Text>
                <Text style={styles.price}>{formatPrice(juice.price)}</Text>
              </View>
              {isSelected && (
                <View style={styles.checkContainer}>
                  <Text style={styles.check}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
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
  header: {
    padding: spacing.lg,
    paddingTop: spacing.base,
    paddingBottom: spacing.base,
  },
  greeting: {
    ...typography.body,
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
    padding: spacing.lg,
    paddingTop: 0,
    paddingBottom: 120,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: colors.accent,
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.base,
  },
  juiceName: {
    ...typography.h3,
    color: colors.text,
  },
  juiceTagline: {
    ...typography.caption,
    color: colors.primary,
    marginTop: 2,
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
  checkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: 40,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});
