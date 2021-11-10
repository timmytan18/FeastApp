import * as Linking from 'expo-linking';
import awsconfig from '../../../aws-exports';

const expoScheme = "feast://"
let redirectLink = Linking.makeUrl();
if (redirectLink.startsWith('exp://127')) {
    // handle simulator(localhost) and device(Lan)
    redirectLink = redirectLink + '/--/';
} else {
    if (redirectLink === expoScheme) {
    } else {
        // handle the expo client
        redirectLink = redirectLink + '/'
    }
}

console.log(redirectLink)

awsconfig.oauth.redirectLogIn = redirectLink;
awsconfig.oauth.redirectSignOut = redirectLink;

export default awsconfig;