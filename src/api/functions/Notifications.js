import { NOTIF_TYPES } from '../../constants/constants';

const sendFollowNotif = ({ follower, expoPushToken }) => {
  if (!follower || !expoPushToken) return;
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'New Follow',
    body: `${follower} started following you`,
    data: { type: NOTIF_TYPES.FOLLOW },
  };
  sendPushNotification(message);
};

const sendYumNotif = ({ yummer, expoPushToken }) => {
  if (!yummer || !expoPushToken) return;
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: 'Yum!',
    body: `${yummer} just yummed your post 😋`,
    data: { type: NOTIF_TYPES.YUM },
  };
  sendPushNotification(message);
};

const sendPushNotification = async (message) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });
};

export { sendFollowNotif, sendYumNotif };
