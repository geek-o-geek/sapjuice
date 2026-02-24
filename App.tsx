/**
 * SapJuice - Healthy juice ordering app
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { UserProvider } from './src/context/UserContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

function App() {
  return (
    <SafeAreaProvider>
      <UserProvider>
      <StatusBar barStyle="dark-content" backgroundColor={colors.surface} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
