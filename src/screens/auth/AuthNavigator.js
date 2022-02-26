import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AuthScreen from './AuthScreen';
import LogIn from './LogIn';
import NameForm from './NameForm';
import Register from './Register';
import Verification from './Verification';
import ForgotEmail from './ForgotEmail';
import ForgotPassword from './ForgotPassword';

export default function AuthNavigator() {
  const AuthStack = createStackNavigator();

  return (
    <NavigationContainer>
      <AuthStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <AuthStack.Screen name="AuthScreen" component={AuthScreen} />
        <AuthStack.Screen name="LogIn" component={LogIn} />
        <AuthStack.Screen name="NameForm" component={NameForm} />
        <AuthStack.Screen name="Register" component={Register} />
        <AuthStack.Screen name="Verification" component={Verification} options={{ gestureEnabled: false }} />
        <AuthStack.Screen name="ForgotEmail" component={ForgotEmail} />
        <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} options={{ gestureEnabled: false }} />
      </AuthStack.Navigator>
    </NavigationContainer>
  );
}
