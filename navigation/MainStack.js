import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from '../screens/SplashScreen';
import AuthScreen from '../screens/AuthScreen';
import DonorListScreen from '../screens/DonorListScreen';
import AddEditDonorScreen from '../screens/AddEditDonorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanel from '../screens/AdminPanel';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  // Debug check to ensure all screens are loaded
  console.log({
    SplashScreen,
    AuthScreen,
    DonorListScreen,
    AddEditDonorScreen,
    ProfileScreen,
    AdminPanel,
  });

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="DonorList" component={DonorListScreen} />
        <Stack.Screen name="AddEditDonor" component={AddEditDonorScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="AdminPanel" component={AdminPanel} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
