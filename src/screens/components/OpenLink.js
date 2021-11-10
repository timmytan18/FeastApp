import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { isIOS } from '../../constants/theme';

export function link(type, alias) {

    console.log(type, alias)

    if (!alias) {
        return
    }

    const links = [null, null];

    if (type == 'YELP') {
        WebBrowser.openBrowserAsync(`https://m.yelp.com/biz/${alias}`)
        return
    } else if (type == 'DEFAULT') {
        WebBrowser.openBrowserAsync(alias)
        return
    }

    if (type == 'INSTAGRAM') {
        links[0] = isIOS ?
            `instagram://user?username=${alias}` :
            `intent://www.instagram.com/${user.instagram}/#Intent;package=com.instagram.android;scheme=https;end`;
        links[1] = `https://www.instagram.com/${alias}/`
    } else if (type == 'doordash') {
        try {
            const currAlias = extractDoordashAlias(alias);
            links[0] = isIOS ?
                `fb676719219112544://store/${currAlias}` :
                `intent://#Intent;package=com.dd.doordash;scheme=doordash://store/${currAlias}/;end`;
        } catch(err) {
            console.log(err)
        }
        links[1] = alias;
    } else if (type == 'grubhub') {
        try {
            const currAlias = extractGrubhubAlias(alias);
            links[0] = isIOS ?
                `grubhubapp://restaurant/${currAlias}` :
                `intent://restaurant/${currAlias}#Intent;package=com.grubhub.android;scheme=grubhubapp;end`;
        } catch(err) {
            console.log(err)
        }
        links[1] = alias;
    } else if (type == 'postmates') {
        try {
            const currAlias = extractPostmatesAlias(alias);
            links[0] = `postmates://v1/places/${currAlias}`;
        } catch(err) {
            console.log(err)
        }
        links[1] = alias;
    } else {
        links[1] = alias;
    }

    if (links[0]) {
        console.log(links[0])
        Linking.openURL(links[0]).catch(err => {
            WebBrowser.openBrowserAsync(links[1])
        });
    } else {
        WebBrowser.openBrowserAsync(links[1])
    }
}

function extractDoordashAlias(url) {
    let i = url.indexOf('store/');
    let curr = url.slice(i+6);
    i = curr.indexOf('/');
    curr = curr.slice(0, i);
    i = curr.lastIndexOf('-');
    return curr.slice(i+1);
}

function extractGrubhubAlias(url) {
    const i = url.indexOf('restaurant/');
    return url.slice(i+11);
}

function extractPostmatesAlias(url) {
    const i = url.indexOf('merchant/');
    return url.slice(i+9);
}