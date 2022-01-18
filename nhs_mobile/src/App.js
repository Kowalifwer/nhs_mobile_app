
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './screens/Home';
import ProfileSetup from './screens/ProfileSetup';
import ProfileUpdate from './screens/ProfileUpdate';
import Authentication from './screens/Authentication';
import Email from "./screens/Email";
import BarcodeScanner from "./screens/BarcodeScanner";
import EmailSetup from "./screens/EmailSetup";
import FoodDiary from './screens/FoodDiary';

const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      
        initialRouteName="ProfileSetup"
        // screenOptions={{
        //   headerTitleAlign: 'center',
        //   headerStyle: {
        //     backgroundColor: '#0080ff'
        //   },
        //   headerTintColor: '#ffffff',
        //   headerTitleStyle: {
        //     fontSize: 25,
        //     fontWeight: 'bold'
        //   }
        // }}
      >
        <Stack.Screen
          name="ProfileSetup"
          component={ProfileSetup}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ProfileUpdate"
          component={ProfileUpdate}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Home"
          options={{
            headerShown: false,
          }}
          component={Home}
        />
        <Stack.Screen
          name="Authentication"
          options={{
            headerShown: false,
          }}
          component={Authentication}
        />
        <Stack.Screen
          name="Email"
          options={{
            headerShown: false,
          }}
          component={Email}
        />
        <Stack.Screen
          name="BarcodeScanner"
          options={{
            headerShown: false,
          }}
          component={BarcodeScanner}
        />
        <Stack.Screen
          name="EmailSetup"
          options={{
            headerShown: false,
          }}
          component={EmailSetup}
        />
        <Stack.Screen
          name="FoodDiary"
          options={{
            headerShown: false,
          }}
          component={FoodDiary}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;