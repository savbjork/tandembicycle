import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './navigation/RootNavigator';
import { AppProviders } from './providers/AppProviders';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import '../../global.css';

// Keep splash screen visible while fonts load
SplashScreen.preventAutoHideAsync();

/**
 * App entry point
 */
export const App: React.FC = () => {
  const [fontsLoaded] = useFonts({
    // 'Barriecito-Regular': require('../../assets/fonts/Barriecito/Barriecito-Regular.ttf'),
    'NanumMyeongjo-Regular': require('../../assets/fonts/Nanum_Myeongjo/NanumMyeongjo-Regular.ttf'),
    'NanumMyeongjo-Bold': require('../../assets/fonts/Nanum_Myeongjo/NanumMyeongjo-Bold.ttf'),
    'NanumMyeongjo-ExtraBold': require('../../assets/fonts/Nanum_Myeongjo/NanumMyeongjo-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProviders>
        <RootNavigator />
      </AppProviders>
    </GestureHandlerRootView>
  );
};
