import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { CommonActions, useNavigationState } from '@react-navigation/native';
import { RegisterScreen } from '../screens/RegisterScreen';
import { SelectJuiceScreen } from '../screens/SelectJuiceScreen';
import { DeliveryScreen } from '../screens/DeliveryScreen';
import { FeedbackScreen } from '../screens/FeedbackScreen';
import { OrderTrackingScreen } from '../screens/OrderTrackingScreen';
import { ReviewsScreen } from '../screens/ReviewsScreen';
import { HamburgerMenu } from '../components';
import { useUser } from '../context/UserContext';
import { getPointsBalance } from '../services/pointsService';
import type { RootStackParamList } from './types';
import { colors, spacing } from '../theme';

const Stack = createStackNavigator<RootStackParamList>();

function HeaderMenu({ navigation }: { navigation: any }) {
  const { user, logout } = useUser();
  const [points, setPoints] = useState(0);
  const navState = useNavigationState((s) => s);

  const refreshPoints = useCallback(async () => {
    if (user?.id) {
      const bal = await getPointsBalance(user.id);
      setPoints(bal);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshPoints();
  }, [refreshPoints, navState]);

  const handleLogout = async () => {
    navigation.dispatch(
      CommonActions.reset({ index: 0, routes: [{ name: 'Register', params: { mode: 'signIn' } }] }),
    );
    await logout();
  };

  const handleReorder = (items: { id: string; name: string; price: number }[]) => {
    if (!user || items.length === 0) return;
    navigation.navigate('Delivery', {
      name: user.name,
      email: user.email,
      phone: user.phone,
      selectedJuices: items,
    });
  };

  const handleSelectJuices = () => {
    if (!user) return;
    navigation.navigate('SelectJuice', {
      name: user.name,
      email: user.email,
      phone: user.phone,
    });
  };

  const handleTrackOrder = (orderId: string) => {
    navigation.navigate('OrderTracking', { orderId });
  };

  const handleReviews = () => {
    navigation.navigate('Reviews');
  };

  return (
    <View style={styles.headerRight}>
      <HamburgerMenu
        userName={user?.name}
        userId={user?.id}
        userPoints={points}
        onLogout={handleLogout}
        onReorder={handleReorder}
        onSelectJuices={handleSelectJuices}
        onTrackOrder={handleTrackOrder}
        onReviews={handleReviews}
      />
    </View>
  );
}

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
      screenOptions={({ navigation }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontWeight: '600', fontSize: 17 },
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        cardStyle: { backgroundColor: colors.background },
        cardOverlayEnabled: false,
        headerRight: () => <HeaderMenu navigation={navigation} />,
      })}
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
        options={{ title: 'Confirmed', headerLeft: () => null, gestureEnabled: false }}
      />
      <Stack.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{ title: 'Tracking' }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ title: 'Reviews' }}
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
  headerRight: {
    marginRight: spacing.base,
  },
});
