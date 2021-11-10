import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
// import updateProfilePic from '../../api/functions/S3Storage';
import { colors, gradients, sizes, wp, hp, shadows } from '../../constants/theme';

const EditProfile = ({ editPressed, setEditPressed, user }) => {

    const [photo, setPhoto] = useState(user.picture ? user.picture : null);

    const choosePhoto = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
            if (status !== 'granted') {
                alert('Sorry, we need camera roll permissions to make this work!');
            }
        }
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.cancelled) {
            setPhoto(result.uri);
        }
    }

    async function saveEdits() {
        if (user.picture != photo) {
            // Store new user profile photo in S3
            // await updateProfilePic(user.PK, user.SK, user.uid, photo)

            // let picture;
            // try {
            //     picture = await Storage.get('profile_pic.jpeg', { 
            //         level: 'protected',
            //         identityId: user.identityId
            //     })
            // } catch (err) {
            //     console.log(err)
            // }

            // console.log(picture)
        }
    }

    return (
        <Modal
            isVisible={editPressed}
            backdropOpacity={0.5}
            backdropTransitionOutTiming={0}
            swipeDirection="down"
            onSwipeComplete={() => setEditPressed(false)}
            onBackdropPress={() => setEditPressed(false)}
            style={{ margin: 0, justifyContent: 'flex-end' }}
        >
            <View style={styles.container}>
                <View style={styles.pfpContainer}>
                    <View style={[styles.userPicture, { backgroundColor: colors.gray }]}>
                        {photo && <Image style={styles.userPicture} source={{ uri: photo }} />}
                    </View>
                    <TouchableOpacity onPress={choosePhoto}>
                        <Text style={styles.changePfpText}>Change Photo</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 0.5 }}>

                </View>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity activeOpacity={0.7}
                        style={[styles.actionButton, { backgroundColor: colors.white }]}
                        onPress={() => setEditPressed(false)}
                    >
                        <Text style={[styles.actionText, { color: colors.black }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={0.7}
                        style={[styles.actionButton, { backgroundColor: colors.black }]}
                        onPress={() => saveEdits()}
                    >
                        <Text style={[styles.actionText, { color: colors.white }]}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}


const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '90%',
        alignContent: 'center',
        borderTopLeftRadius: wp(4),
        borderTopRightRadius: wp(4),
        backgroundColor: 'white',
    },
    pfpContainer: {
        paddingTop: wp(3),
        marginLeft: wp(1),
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: hp(1.4)
    },
    userPicture: {
        width: wp(26),
        height: wp(26),
        borderRadius: wp(26) / 2,
        marginBottom: hp(2)
    },
    changePfpText: {
        fontFamily: 'Semi',
        fontSize: sizes.h4,
        color: colors.accent,
    },
    actionsContainer: {
        flexDirection: 'row',
        width: '65%',
        justifyContent: 'space-between',
        alignSelf: 'center'
    },
    actionButton: {
        height: wp(11),
        width: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wp(3)
    },
    actionText: {
        fontFamily: 'Medium',
        fontSize: sizes.h4
    }
});

export default EditProfile;