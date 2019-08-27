import * as React from 'react';
import { createStackNavigator, createAppContainer } from 'react-navigation';

const AppNavigator = createStackNavigator({
  Menu: {
    screen: require('./Menu').default,
    navigationOptions: {
      title: 'Menu',
    },
  },
  LockedOrientation: {
    screen: require('./LockedOrientation').default,
    navigationOptions: {
      title: 'LockedOrientation',
    },
  },
  SelectOrientation: {
    screen: require('./SelectOrientation').default,
    navigationOptions: {
      title: 'SelectOrientation',
    },
  },
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.PureComponent<{}> {
  public render() {
    return (
      <AppContainer />
    );
  }
}
