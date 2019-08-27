import * as React from 'react';
import { ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';
import { NavigationActions, NavigationInjectedProps } from 'react-navigation';

export default class SelectOrientation extends React.PureComponent<NavigationInjectedProps> {
  public render() {
    return (
      <ScrollView>

        <ListItem
          title="Orientation"
          chevron={true}
        />

        <ListItem
          title="Allow Portrait"
          checkBox={{
            checked: true,
          }}
        />

      </ScrollView>
    );
  }
}
