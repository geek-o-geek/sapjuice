import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

type StepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
};

export function StepIndicator({
  currentStep,
  totalSteps,
  stepLabels,
}: StepIndicatorProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, i) => {
        const isActive = i + 1 === currentStep;
        const isComplete = i + 1 < currentStep;
        return (
          <React.Fragment key={i}>
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.dot,
                  isActive && styles.dotActive,
                  isComplete && styles.dotComplete,
                ]}
              >
                {isComplete ? (
                  <Text style={styles.check}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      isActive && styles.stepNumberActive,
                    ]}
                  >
                    {i + 1}
                  </Text>
                )}
              </View>
              {stepLabels?.[i] && (
                <Text
                  style={[
                    styles.label,
                    isActive && styles.labelActive,
                    isComplete && styles.labelComplete,
                  ]}
                  numberOfLines={1}
                >
                  {stepLabels[i]}
                </Text>
              )}
            </View>
            {i < totalSteps - 1 && (
              <View
                style={[
                  styles.connector,
                  isComplete && styles.connectorComplete,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: {
    backgroundColor: colors.primary,
  },
  dotComplete: {
    backgroundColor: colors.primary,
  },
  stepNumber: {
    ...typography.captionBold,
    color: colors.textMuted,
  },
  stepNumberActive: {
    color: colors.surface,
  },
  check: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.surface,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    maxWidth: 72,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  labelComplete: {
    color: colors.textSecondary,
  },
  connector: {
    flex: 1,
    maxWidth: 32,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 2,
  },
  connectorComplete: {
    backgroundColor: colors.primary,
  },
});
