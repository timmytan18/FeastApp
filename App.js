import React, { useState, useContext } from 'react';
import {
  Platform, StatusBar, View, Image,
} from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import Store from './src/Store';
import Main from './src/Main';

const App = () => {
  const [fontsLoaded] = useFonts({
    Book: require('./assets/Jost/Book.otf'),
    BookItalic: require('./assets/Jost/BookItalic.otf'),
    Medium: require('./assets/Jost/Medium.otf'),
    MediumItalic: require('./assets/Jost/MediumItalic.otf'),
    Semi: require('./assets/Jost/Semi.otf'),
    SemiItalic: require('./assets/Jost/SemiItalic.otf'),
    Bold: require('./assets/Jost/Bold.otf'),
    BoldItalic: require('./assets/Jost/BoldItalic.otf'),
  });

  const [isSplashReady, setSplashReady] = useState(false);
  const [isAppReady, setAppReady] = useState(false);

  async function cacheSplashResourcesAsync() {
    const image = require('./assets/splash.png');
    return Asset.fromModule(image).downloadAsync();
  }

  async function cacheResourcesAsync() {
    const images = [
      require('./assets/authbackground.jpg'),
    ];

    const cacheImages = images.map((image) => Asset.fromModule(image).downloadAsync());

    await Promise.all(cacheImages);
    setAppReady(true);
  }

  if (!isSplashReady || !fontsLoaded) {
    return (
      <AppLoading
        startAsync={() => cacheSplashResourcesAsync()}
        onFinish={() => setSplashReady(true)}
        onError={console.warn}
        autoHideSplash
      />
    );
  }

  if (!isAppReady) {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={require('./assets/splash.png')}
          onLoad={() => cacheResourcesAsync()}
        />
      </View>
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
