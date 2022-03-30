import React, { useContext } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import NoProfile from './util/icons/NoProfile';
import awsmobile from '../../aws-exports';
import { Context } from '../../Store';

const { aws_user_files_s3_bucket: bucket } = awsmobile;

// Display follower/following users' pfp using S3 link first,
// then external provider links (if exists),
// then default profile pic svg
const ProfilePic = ({
  uid, extUrl, isLocal, isMe, size, style,
}) => {
  const key = `profile_images/${uid}`;
  const url = `https://${bucket}.s3.amazonaws.com/public/${key}?${new Date()}`;

  const iconStyle = { height: size, width: size, borderRadius: size / 2 };

  const [{ bannedUsers }] = useContext(Context);
  const banned = bannedUsers.has(uid);

  return (
    <View style={[
      style,
      iconStyle,
    ]}
    >
      {!isMe && !banned && (
        <Image
          source={{ uri: url }}
          resizeMode="cover"
          style={[
            styles.iconImage,
            iconStyle,
            { zIndex: 2 },
          ]}
        />
      )}
      {(isMe || (extUrl && url !== extUrl)) && !banned && (
        <Image
          source={{ uri: isLocal ? extUrl : `${extUrl}?${new Date()}` }}
          resizeMode="cover"
          style={[
            styles.iconImage,
            iconStyle,
            { zIndex: 1 },
          ]}
        />
      )}
      <View
        style={[{
          position: 'absolute', zIndex: 0, justifyContent: 'center', alignItems: 'center',
        }, iconStyle]}
      >
        <NoProfile size={size} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconImage: {
    flex: 1,
    position: 'absolute',
  },
});

export default ProfilePic;
