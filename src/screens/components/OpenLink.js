import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { isIOS } from '../../constants/theme';

function extractDoordashAlias(url) {
  let i = url.indexOf('store/');
  let curr = url.slice(i + 6);
  i = curr.indexOf('/');
  if (i >= 0) {
    curr = curr.slice(0, i);
  }
  i = curr.lastIndexOf('-');
  return curr.slice(i + 1);
}

function extractGrubhubAlias(url) {
  const i = url.indexOf('restaurant/');
  return url.slice(i + 11);
}

function extractPostmatesAlias(url) {
  const i = url.indexOf('merchant/');
  return url.slice(i + 9);
}

export default async function link({ type, alias, callback }) {
  if (!alias) {
    return;
  }

  const links = [null, null];

  if (type === 'YELP') {
    await WebBrowser.openBrowserAsync(`https://m.yelp.com/biz/${alias}`);
    return;
  } if (type === 'DEFAULT') {
    const res = await WebBrowser.openBrowserAsync(alias);
    if (callback && res.type === 'cancel') callback();
    return;
  }

  if (type === 'INSTAGRAM') {
    links[0] = isIOS
      ? `instagram://user?username=${alias}`
      : `intent://www.instagram.com/${user.instagram}/#Intent;package=com.instagram.android;scheme=https;end`;
    links[1] = `https://www.instagram.com/${alias}/`;
  } else if (type === 'doordash') {
    try {
      const currAlias = extractDoordashAlias(alias);
      links[0] = isIOS
        ? `fb676719219112544://store/${currAlias}`
        : `intent://#Intent;package=com.dd.doordash;scheme=doordash://store/${currAlias}/;end`;
    } catch (err) {
      console.warn(err);
    }
    links[1] = alias;
  } else if (type === 'grubhub') {
    try {
      const currAlias = extractGrubhubAlias(alias);
      links[0] = isIOS
        ? `grubhubapp://restaurant/${currAlias}`
        : `intent://restaurant/${currAlias}#Intent;package=com.grubhub.android;scheme=grubhubapp;end`;
    } catch (err) {
      console.warn(err);
    }
    links[1] = alias;
  } else if (type === 'postmates') {
    try {
      const currAlias = extractPostmatesAlias(alias);
      links[0] = `postmates://v1/places/${currAlias}`;
    } catch (err) {
      console.warn(err);
    }
    links[1] = alias;
  } else {
    links[1] = alias;
  }

  if (links[0]) {
    Linking.openURL(links[0]).catch((err) => {
      WebBrowser.openBrowserAsync(links[1]).then((res) => {
        if (callback && res.type === 'cancel') callback();
      });
    });
  } else {
    const res = await WebBrowser.openBrowserAsync(links[1]);
    if (callback && res.type === 'cancel') callback();
  }
}
