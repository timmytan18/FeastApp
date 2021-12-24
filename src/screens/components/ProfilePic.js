import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import NoProfile from './util/icons/NoProfile';
import { colors, sizes } from '../../constants/theme';
// import awsmobile from '../../../aws-exports';
// const { aws_user_files_s3_bucket: bucket } = awsmobile;


// Display follower/following users' pfp using S3 link first,
// then external provider links (if exists), 
// then default profile pic svg
const ProfilePic = ({ uid, extUrl, size, style }) => {

    // const key = `profile_images/${uid}`;
    // let url = `https://${bucket}.s3.amazonaws.com/public/${key}`;

    const key = `profile_images/${uid}`;
    let url = ``;

    return (
        <View style={[
            styles.iconContainer,
            style,
            { height: size, width: size, borderRadius: size/2 }
        ]}>
            {/* <Image
                source={{ uri: url }}
                resizeMode='cover'
                style={[
                    styles.iconImage,
                    { position: 'absolute', zIndex: 2, height: size, width: size, borderRadius: size/2 }
                ]}
            /> */}
            {extUrl && url != extUrl && <Image
                source={{ uri: extUrl }}
                resizeMode='cover'
                style={[
                    styles.iconImage,
                    { position: 'absolute', zIndex: 1, height: size, width: size, borderRadius: size/2 }
                ]}
            />}
            <View style={{ position: 'absolute', zIndex: 0, height: size, width: size, borderRadius: size/2 }}>
                <NoProfile size={size} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        backgroundColor: colors.gray
    },
    iconImage: {
        flex: 1
    },
});

export default ProfilePic;