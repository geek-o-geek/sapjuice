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
        const step = i + 1;
        const isActive = step === currentStep;
        const isComplete = step < currentStep;
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
                      (isActive || isComplete) && styles.stepNumberActive,
                    ]}
                  >
                    {step}
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
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dotComplete: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNumber: {
    ...typography.captionBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  stepNumberActive: {
    color: '#FFFFFF',
  },
  check: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 6,
    maxWidth: 72,
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  labelComplete: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  connector: {
    flex: 1,
    maxWidth: 36,
    height: 2.5,
    backgroundColor: colors.border,
    marginHorizontal: 2,
    borderRadius: 2,
  },
  connectorComplete: {
    backgroundColor: colors.primary,
  },
});
