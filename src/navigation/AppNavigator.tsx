import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SelectJuiceScreen } from '../screens/SelectJuiceScreen';
import { DeliveryScreen } from '../screens/DeliveryScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { useUser } from '../context/UserContext';
import type { RootStackParamList } from './types';
import { colors } from '../theme';

const Stack = createStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={user ? 'SelectJuice' : 'Register'}
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerShadowVisible: false,
        cardStyle: { backgroundColor: colors.background },
        cardOverlayEnabled: false,
      }}
    >
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelectJuice"
        component={SelectJuiceScreen}
        options={{ title: 'Select Juice' }}
        initialParams={user ? { name: user.name, email: user.email, phone: user.phone } : undefined}
      />
      <Stack.Screen
        name="Delivery"
        component={DeliveryScreen}
        options={{ title: 'Delivery' }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{ title: 'Order confirmed', headerLeft: () => null, gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
