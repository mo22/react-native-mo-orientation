# react-native-mo-orientation

Lets you query and lock the device orientation

## Usage

```ts
import { Orientation, OrientationConsumer, OrientationLock } from 'react-native-mo-orientation';

console.log(Orientation.interfaceOrientation.value);

const sub = Orientation.interfaceOrientation.subscribe((orientation) => {
});
// ...
sub.release();

return (
  <OrientationLock allowed="portrait" />
  <OrientationLock allowed="any" />
);

return (
  <OrientationConsumer>
    {(orientation) => (
      <SomeObject orientation={orientation} />
    )}
  </OrientationConsumer>
)
```

## Notes
- on iPad/universal apps the orientation locking only works for full screen apps
- android cannot handle orientation locks like portrait + landscapeleft

## TODO
- [ ] check which is the correct field for orientations (check tablet etc.?) on android
  -> display.getRotation() or configuration.getOrientation() ?
  -> on galaxy tab and phones getRotation works out
