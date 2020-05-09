import React from 'react';
import {Icon} from 'react-native-elements';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import HomeScreen from './Screens/HomeScreen';
import HistoryScreen from './Screens/HistoryScreen';

//using bottom tab navigator for the app
const AppStack = createBottomTabNavigator(
  {
    Home: HomeScreen,
    History: HistoryScreen,
  },
  {
    //set icon for tab bar
    defaultNavigationOptions: ({navigation}) => ({
      tabBarIcon: ({tintColor}) => {
        const {routeName} = navigation.state;
        let iconName;
        if (routeName === 'Home') {
          iconName = 'home';
        } else {
          iconName = 'view-list';
        }
        return <Icon name={iconName} size={25} color={tintColor} />;
      },
    }),
    tabBarOptions: {
      activeTintColor: '#04BFBF',
      inactiveTintColor: '#8e8e93',
      labelStyle: {
        fontSize: 14,
      },
      allowFontScaling: false,
      style: {
        backgroundColor: 'white',
        borderTopWidth: 1,
        borderTopColor: '#04ADBF',
      },
      bottomTabs: {
        visible: true,
      },
    },
  },
);

const AppContainer = createAppContainer(AppStack);

export default class App extends React.Component {
  render() {
    return <AppContainer />;
  }
}
