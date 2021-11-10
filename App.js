import React, { useState, useContext } from 'react';
import { Platform, SafeAreaView, StatusBar, View, Image } from 'react-native';
import { useFonts } from 'expo-font';
import AppLoading from 'expo-app-loading';
import { Asset } from 'expo-asset';

import Store from './src/Store';
import Main from './src/Main';

const App = () => {

    let [fontsLoaded] = useFonts({
        'Book': require('./assets/Jost/Book.otf'),
        'BookItalic': require('./assets/Jost/BookItalic.otf'),
        'Medium': require('./assets/Jost/Medium.otf'),
        'Semi': require('./assets/Jost/Semi.otf'),
        'Bold': require('./assets/Jost/Bold.otf'),
        'BoldItalic': require('./assets/Jost/BoldItalic.otf'),
    });

    const [isSplashReady, setSplashReady] = useState(false);
    const [isAppReady, setAppReady] = useState(false);

    if (!isSplashReady || !fontsLoaded) {
        console.log('splash not ready')
        return (
            <AppLoading
                startAsync={() => _cacheSplashResourcesAsync()}
                onFinish={() => setSplashReady(true)}
                onError={console.warn}
                autoHideSplash={false}
            />
        );
    }

    if (!isAppReady) {
        console.log('app not ready')
        return (
            <View style={{ flex: 1 }}>
                <Image
                    source={require('./assets/splash.png')}
                    onLoad={() => _cacheResourcesAsync()}
                />
            </View>
        );
    }

    async function _cacheSplashResourcesAsync() {
        console.log('splash resources')
        const image = require('./assets/splash.png');
        return Asset.fromModule(image).downloadAsync();
    }

    async function _cacheResourcesAsync() {
        console.log('cache resources')
        const images = [
            require('./assets/authbackground.jpg'),
        ];

        const cacheImages = images.map(image => {
            return Asset.fromModule(image).downloadAsync();
        });

        await Promise.all(cacheImages);
        setAppReady(true)
    }

    return (
        <View style={{ flex: 1 }}>
            {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
            {/* <SafeAreaView style={{ flex: 0, backgroundColor: 'transparent' }} /> */}
            <Store>
                <Main />
            </Store>
        </View>
    );
}

export default App;