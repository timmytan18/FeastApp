import { API, graphqlOperation, Storage } from 'aws-amplify';
import awsmobile from '../../aws-exports';
import { updateFeastItem } from '../graphql/mutations';

const { aws_user_files_s3_bucket: bucket } = awsmobile;

export default async function updateProfilePic(PK, SK, uid, img) {
  if (img) {
    const response = await fetch(img);
    const blob = await response.blob();
    const key = `profile_images/${uid}`;
    const url = `https://${bucket}.s3.amazonaws.com/public/${key}`;
    try {
      await Storage.put(key, blob, {
        contentType: 'image/jpeg',
      });
      await API.graphql(graphqlOperation(
        updateFeastItem,
        { input: { PK, SK, picture: url } },
      ));
    } catch (err) {
      console.log(err);
    }
  }
}
