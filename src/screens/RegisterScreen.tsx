import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';
import { Button, Input } from '../components';
import { useUser } from '../context/UserContext';
import { signUpUser, signInUser } from '../utils/userStorage';
import { colors, typography, spacing, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
  route: RouteProp<RootStackParamList, 'Register'>;
};

export function RegisterScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { setUser } = useUser();
  const scrollRef = useRef<ScrollView>(null);
  const [isSignUp, setIsSignUp] = useState(route.params?.mode !== 'signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ name: false, email: false, phone: false, password: false });

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isValidPhone = /^\d{7,15}$/.test(phone.trim());
  const isValidName = name.trim().length >= 2;
  const isValidPassword = password.length >= 6;

  const errors = {
    name: touched.name && !isValidName ? 'Enter at least 2 characters' : undefined,
    email: touched.email && !isValidEmail ? 'Enter a valid email address' : undefined,
    phone: touched.phone && !isValidPhone ? 'Enter a valid phone number' : undefined,
    password: touched.password && !isValidPassword ? 'Password must be at least 6 characters' : undefined,
  };

  const canProceed = isSignUp
    ? isValidName && isValidEmail && isValidPhone && isValidPassword
    : isValidEmail && isValidPassword;

  const emailRef = useRef<TextInput | null>(null);
  const phoneRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  const handleSubmit = async () => {
    setTouched({ name: true, email: true, phone: true, password: true });
    if (!canProceed) return;

    setLoading(true);

    try {
      if (isSignUp) {
        const result = await signUpUser(email.trim(), password, name.trim(), phone.trim());
        setLoading(false);
        if (result.error) {
          if (result.error.toLowerCase().includes('already registered')) {
            Toast.show({ type: 'info', text1: 'Account exists', text2: 'This email is already registered. Please sign in instead.' });
            setIsSignUp(false);
          } else {
            Toast.show({ type: 'error', text1: 'Sign up failed', text2: result.error });
          }
        } else if (result.needsConfirmation) {
          Toast.show({ type: 'success', text1: 'Check your email', text2: 'We sent a confirmation link. Verify then sign in.' });
          setIsSignUp(false);
        } else if (result.user) {
          setUser(result.user);
          navigation.reset({
            index: 0,
            routes: [{ name: 'SelectJuice', params: { name: result.user.name, email: result.user.email, phone: result.user.phone } }],
          });
        } else {
          Toast.show({ type: 'error', text1: 'Sign up failed', text2: 'Please try again.' });
        }
      } else {
        const { user: signedIn, error } = await signInUser(email.trim(), password);
        setLoading(false);
        if (error) {
          Toast.show({ type: 'error', text1: 'Sign in failed', text2: error });
        } else if (signedIn) {
          setUser(signedIn);
          navigation.reset({
            index: 0,
            routes: [{ name: 'SelectJuice', params: { name: signedIn.name, email: signedIn.email, phone: signedIn.phone } }],
          });
        } else {
          Toast.show({ type: 'error', text1: 'Sign in failed', text2: 'Please try again.' });
        }
      }
    } catch (e: any) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Error', text2: e?.message ?? 'Something went wrong. Please try again.' });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(spacing.xxl, insets.top + spacing.lg),
            paddingBottom: Math.max(spacing.xxl, insets.bottom + spacing.lg),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoSection}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>SapJuice</Text>
          <Text style={styles.tagline}>
            {isSignUp ? 'Create an account to order fresh juice' : 'Sign in to order fresh juice'}
          </Text>
        </View>

        <View style={styles.formCard}>
          {isSignUp && (
            <Input
              label="Full name"
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              error={errors.name}
            />
          )}
          <Input
            inputRef={emailRef}
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            onBlur={() => setTouched((p) => ({ ...p, email: true }))}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => (isSignUp ? phoneRef : passwordRef).current?.focus()}
            error={errors.email}
          />
          {isSignUp && (
            <Input
              inputRef={phoneRef}
              label="Phone number"
              placeholder="9876543210"
              value={phone}
              onChangeText={(text) => {
                const digits = text.replace(/[^0-9]/g, '');
                setPhone(digits);
              }}
              onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
              keyboardType="number-pad"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={errors.phone}
            />
          )}
          <Input
            inputRef={passwordRef}
            label="Password"
            placeholder={isSignUp ? 'Create a password (min 6 chars)' : 'Enter your password'}
            value={password}
            onChangeText={setPassword}
            onBlur={() => setTouched((p) => ({ ...p, password: true }))}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            error={errors.password}
          />
        </View>

        <Button
          title={isSignUp ? 'Create account' : 'Sign in'}
          onPress={handleSubmit}
          disabled={!canProceed}
          loading={loading}
        />

        <TouchableOpacity
          style={styles.switchRow}
          onPress={() => {
            setIsSignUp((prev) => !prev);
            setTouched({ name: false, email: false, phone: false, password: false });
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.switchText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.switchLink}>
              {isSignUp ? 'Sign in' : 'Create one'}
            </Text>
          </Text>
        </TouchableOpacity>
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
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoImage: {
    width: 88,
    height: 88,
    borderRadius: 22,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  logoText: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  switchRow: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  switchText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  switchLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});
