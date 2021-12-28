import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import NoProfile from './util/icons/NoProfile';
import { colors, sizes } from '../../constants/theme';
import awsmobile from '../../aws-exports';
const { aws_user_files_s3_bucket: bucket } = awsmobile;


// Display follower/following users' pfp using S3 link first,
// then external provider links (if exists), 
// then default profile pic svg
const ProfilePic = ({ uid, extUrl, isMe, size, style }) => {

    const key = `profile_images/${uid}`;
    let url = `https://${bucket}.s3.amazonaws.com/public/${key}`;
    
    const iconStyle = { height: size, width: size, borderRadius: size/2 };

    return (
        <View style={[
            style,
            iconStyle,
        ]}>
            {!isMe && <Image
                source={{ uri: url }}
                resizeMode='cover'
                style={[
                    styles.iconImage,
                    iconStyle,
                    { zIndex: 2 }
                ]}
            />}
            {(isMe || (extUrl && url != extUrl)) && <Image
                source={{ uri: extUrl }}
                resizeMode='cover'
                style={[
                    styles.iconImage,
                    iconStyle,
                    { zIndex: 1 }
                ]}
            />}
            <View style={[{ position: 'absolute', zIndex: 0}, iconStyle]}>
                <NoProfile size={size} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    iconImage: {
        flex: 1,
        position: 'absolute'
    },
});

export default ProfilePic;