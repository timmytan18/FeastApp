import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image, ImageBackground, Modal, Button } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import { Auth } from 'aws-amplify';
// import { useHeaderHeight } from '@react-navigation/stack';
// import { StreamApp, FlatFeed, Activity, Card, LikeButton, StatusUpdateForm, updateStyle } from 'expo-activity-feed';
// import { useScrollToTop } from '@react-navigation/native';
// import { useCollapsibleHeader } from 'react-navigation-collapsible';
// import ReadMore from '@fawazahmed/react-native-read-more';
// import { LinearGradient } from 'expo-linear-gradient';
// import Stars from 'react-native-stars';
// import { StarFull, StarHalf, StarEmpty } from '../components/util/icons/Star';
// import SearchButton from '../components/util/SearchButton';
// import Ratings from '../components/Ratings';
// import MyCarousel from '../Carousel';
// import Lightbox from '../components/Lightbox';
// import MapMarker from '../components/util/icons/MapMarker';
// import YumButton from '../components/util/YumButton';
// import Line from '../components/util/Line';
import { Context } from '../../Store';
// import { sizes, colors, hp, wp } from '../../constants/theme';

const Home = ({ navigation }) => {

    const [state, dispatch] = useContext(Context);

    useEffect(() => {
        (async () => {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied')
            }

            const { coords } = await Location.getCurrentPositionAsync({});
            console.log(coords);

            dispatch({
                type: 'SET_LOCATION', payload: {
                    longitude: coords.longitude,
                    latitude: coords.latitude
                }
            })

        })();
    }, [])

    console.log(state.location)

    if (!state.location) {
        return (null);
    }

    SplashScreen.hideAsync();

    return (
        <View style={styles.container}>
            <Text>Hello World!</Text>
            <Button
                title="Logout"
                onPress={() => Auth.signOut()}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
});

export default Home;