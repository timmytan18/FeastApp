import React, { useState, useEffect } from 'react';
import {
  Platform, StatusBar, View,
} from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import Store from './src/Store';
import Main from './src/Main';

import splash from './assets/splash.png';
import Book from './assets/Jost/Book.otf';
import BookItalic from './assets/Jost/BookItalic.otf';
import Medium from './assets/Jost/Medium.otf';
import MediumItalic from './assets/Jost/MediumItalic.otf';
import Semi from './assets/Jost/Semi.otf';
import SemiItalic from './assets/Jost/SemiItalic.otf';
import Bold from './assets/Jost/Bold.otf';
import BoldItalic from './assets/Jost/BoldItalic.otf';

const App = () => {
  const [fontsLoaded] = useFonts({
    Book,
    BookItalic,
    Medium,
    MediumItalic,
    Semi,
    SemiItalic,
    Bold,
    BoldItalic,
  });

  const [isSplashReady, setSplashReady] = useState(false);

  async function cacheSplashResourcesAsync() {
    return Asset.fromModule(splash).downloadAsync();
  }

  if (!isSplashReady || !fontsLoaded) {
    return (
      <AppLoading
        startAsync={() => cacheSplashResourcesAsync()}
        onFinish={() => setSplashReady(true)}
        onError={console.warn}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
      <SafeAreaProvider>
        <Store>
          <Main />
        </Store>
      </SafeAreaProvider>
    </View>
  );
};

export default App;
