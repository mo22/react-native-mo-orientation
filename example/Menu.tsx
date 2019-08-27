import * as React from 'react';
import { ScrollView } from 'react-native';
import { ListItem } from 'react-native-elements';

export default class Menu extends React.PureComponent<{}> {
  public render() {
    return (
      <ScrollView>

        <ListItem
          title="nothing"
          chevron={true}
          onPress={() => {
          }}
        />

      </ScrollView>
    );
  }
}
