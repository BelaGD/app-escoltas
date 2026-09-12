import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import {
  BarlowCondensed_400Regular,
  BarlowCondensed_600SemiBold,
  Barlow_400Regular,
  Barlow_500Medium,
  Barlow_600SemiBold,
  Barlow_700Bold,
} from './src/theme/theme';
import { color } from './src/theme/theme';
import { StoreProvider, useStore } from './src/state/store';
import { AuthScreen } from './src/screens/AuthScreen';
import { Shell } from './src/screens/Shell';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { state } = useStore();
  return state.sesion ? <Shell /> : <AuthScreen />;
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    BarlowCondensed_400Regular,
    BarlowCondensed_600SemiBold,
    Barlow_400Regular,
    Barlow_500Medium,
    Barlow_600SemiBold,
    Barlow_700Bold,
  });

  const onLayout = useCallback(async () => {
    if (fontsLoaded || fontError) await SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayout();
  }, [onLayout]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={styles.container} onLayout={onLayout}>
          <Root />
          <StatusBar style="dark" />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
});
