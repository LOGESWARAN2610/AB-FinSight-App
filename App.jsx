import React, {useEffect, useState} from 'react';
import {SafeAreaView, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Styles from './Src/Styles/Style';
import SignIn from './Src/Components/SignIn/SignIn';
// import SignIn from './Components/Js/SignIn/SignIn';
// import Home from './Components/Js/Home/Home';
import Home from './Src/Components/Home/Home';
import DashBoard from './Src/Components/Dashboard/DashBoard';
import Transaction from './Src/Components/Transaction/Transaction';
// import Transaction from './Components/Js/Transaction/Transaction';
// import DashBoard from './Components/Js/Dashboard/DashBoard';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {UserContext} from './Src/Components/Accessories/Accessories';

const Bar = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const screenOptions = {
  headerShown: false,
  // tabBarActiveTintColor: Styles['themeColor']['color'],
  tabBarStyle: {backgroundColor: '#ffffff'},
  tabBarInactiveTintColor: '#000000',
  tabBarLabelStyle: {fontSize: 12},
};

export default function App() {
  const [userDetails, setUserDetails] = useState({
    isAuthenticated: false,
    isAdmin: false,
    Path: 'SignIn',
  });

  return (
    <UserContext.Provider
      value={{contextDetails: userDetails, setContextDetails: setUserDetails}}>
      <NavigationContainer>
        <SafeAreaView style={[Styles['safeAreaView']]}>
          {userDetails['isAuthenticated'] ? (
            <Bar.Navigator
              initialRouteName={userDetails['Path']}
              screenOptions={screenOptions}>
              <Bar.Screen
                name="DashBoard"
                component={DashBoard}
                options={{
                  tabBarLabel: 'DashBoard',
                  tabBarIcon: ({color, size}) => (
                    <MaterialIcons
                      name="dashboard"
                      color={color}
                      size={size - 5}
                    />
                  ),
                }}
              />
              <Bar.Screen
                name="Home"
                component={Home}
                options={{
                  tabBarLabel: 'Expenses',
                  tabBarIcon: ({color, size}) => (
                    <FontAwesome name="home" color={color} size={size - 5} />
                  ),
                }}
              />
              {userDetails.isAdmin && (
                <Bar.Screen
                  name="Transaction"
                  component={Transaction}
                  options={{
                    tabBarLabel: 'Transaction',
                    tabBarIcon: ({color, size}) => (
                      <FontAwesome
                        name="th-list"
                        color={color}
                        size={size - 5}
                      />
                    ),
                  }}
                />
              )}
            </Bar.Navigator>
          ) : (
            <Stack.Navigator
              initialRouteName="SignIn"
              screenOptions={screenOptions}>
              <Stack.Screen name="SignIn" component={SignIn} />
            </Stack.Navigator>
          )}
        </SafeAreaView>
      </NavigationContainer>
    </UserContext.Provider>
  );
}
