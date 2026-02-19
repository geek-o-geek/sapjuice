import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import { Button, Input, StepIndicator } from '../components';
import { useUser } from '../context/UserContext';
import { colors, typography, spacing } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
};

const { width: screenWidth } = Dimensions.get('window');
const heroWidth = screenWidth - spacing.lg * 2;

export function RegisterScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setUser } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const canProceed = name.trim().length > 0 && email.trim().length > 0 && phone.trim().length > 0;

  const handleContinue = () => {
    if (canProceed) {
      const userData = { name: name.trim(), email: email.trim(), phone: phone.trim() };
      setUser(userData);
      navigation.navigate('SelectJuice', userData);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Math.max(spacing.xxl, insets.top + spacing.lg) },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <StepIndicator
          currentStep={1}
          totalSteps={4}
          stepLabels={['Account', 'Juice', 'Delivery', 'Confirmed']}
        />

        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1621506283137-4c4b1638bf4e?w=800&q=80' }}
          style={[styles.heroContainer, { width: heroWidth }]}
          imageStyle={styles.heroImageStyle}
          resizeMode="cover"
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Text style={styles.logo}>SapJuice</Text>
            <Text style={styles.tagline}>Fresh-pressed goodness, delivered to you</Text>
          </View>
        </ImageBackground>

        <View style={styles.header}>
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>
            Just a few details so we can get your order to you. We'll send confirmation and delivery updates via push notifications.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Full name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Input
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone number"
            placeholder="Your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!canProceed}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  heroContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.primary,
  },
  heroImageStyle: {
    borderRadius: 16,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    ...typography.h1,
    color: colors.surface,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255,255,255,0.95)',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    marginBottom: spacing.lg,
  },
});
