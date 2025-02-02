import React, {useContext, useRef, useState} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Styles from './Src/Styles/Style';
import SignIn from './Src/Components/SignIn/SignIn';
import Home from './Src/Components/Home/Home';
import DashBoard from './Src/Components/Dashboard/DashBoard';
import Transaction from './Src/Components/Transaction/Transaction';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {UserContext} from './Src/Components/Accessories/Accessories';
import {Menu, MenuItem} from 'react-native-material-menu';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Bar = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MenuButton = () => {
  const {contextDetails, setContextDetails} = useContext(UserContext);
  const [menuVisible, setMenuVisible] = useState(false),
    menuRef = useRef(null),
    showMenu = () => {
      setMenuVisible(true);
      menuRef.current.show();
    },
    hideMenu = () => {
      setMenuVisible(false);
      menuRef.current.hide();
    },
    toggleMenu = () => {
      menuVisible ? hideMenu() : showMenu();
    };

  return (
    <View>
      <Menu
        style={{
          borderRadius: 5,
          marginTop: 45,
          borderWidth: 1,
          borderColor: '#999',
        }}
        ref={menuRef}
        anchor={
          <TouchableOpacity onPress={toggleMenu} activeOpacity={0.7}>
            <MaterialIcons
              name={'menu' + (menuVisible ? '-open' : '')}
              color={Styles.themeColor.color}
              size={35}
            />
          </TouchableOpacity>
        }>
        {contextDetails['Name'] && (
          <MenuItem
            onPress={() => {
              hideMenu();
            }}>
            {contextDetails['Name']}
          </MenuItem>
        )}
        <MenuItem
          onPress={() => {
            hideMenu();
            AsyncStorage.removeItem('logInDetails');
            setContextDetails({isAuthenticated: false});
          }}>
          Logout
        </MenuItem>
        <MenuItem
          onPress={() => {
            hideMenu();
          }}>
          Close
        </MenuItem>
      </Menu>
    </View>
  );
};

const screenOptions = {
  headerShown: false,
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

  if (userDetails['isAuthenticated']) {
    screenOptions['header'] = () => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 5,
          paddingHorizontal: 10,
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
        }}>
        <View
          style={{
            flexDirection: 'row',
            display: 'flex',
            alignItems: 'flex-end',
            display: 'flex',
            flex: 1,
            position: 'relative',
          }}>
          <Image
            source={require('./Src/assets/AB-Logo.png')}
            alt="AB Logo"
            style={{
              width: 30,
              height: 30,
            }}
          />
          <Text
            style={{
              fontSize: 25,
              color: Styles.themeColor.color,
              fontWeight: 'bold',
              marginLeft: 10,
            }}>
            Analytic Brains
          </Text>
        </View>
        <MenuButton />
      </View>
    );
  }
  screenOptions['headerShown'] = userDetails['isAuthenticated'];

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
