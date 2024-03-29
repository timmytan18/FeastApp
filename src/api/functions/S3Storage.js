import { API, graphqlOperation, Storage } from 'aws-amplify';
import awsmobile from '../../aws-exports';
import { updateFeastItem } from '../graphql/mutations';

const { aws_user_files_s3_bucket: bucket } = awsmobile;

export default async function updateProfilePic(PK, SK, uid, img) {
  if (img) {
    Storage.configure({ level: 'public' });
    const response = await fetch(img);
    const blob = await response.blob();
    const key = `profile_images/${uid}`;
    const url = `https://${bucket}.s3.amazonaws.com/public/${key}`;
    try {
      await Storage.put(key, blob, {
        contentType: 'image/jpeg',
      });
    } catch (err) {
      console.warn('Error storing updated profile picture in S3:', err);
      return;
    }
    Storage.configure({ level: 'protected' });

    try {
      await API.graphql(graphqlOperation(
        updateFeastItem,
        { input: { PK, SK, picture: url } },
      ));
    } catch (err) {
      console.warn('Error updating S3 url in DB:', err);
      return;
    }
    return url;
  }
}
