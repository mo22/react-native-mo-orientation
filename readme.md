# react-native-mo-orientation

Lets you query and lock the device orientation

## Usage

```ts
import { Orientation, OrientationConsumer, OrientationLock } from 'react-native-mo-orientation';

console.log(Orientation.interfaceOrientation.value);

const sub = Orientation.interfaceOrientation.susbscribe((orientation) => {
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

## TODO
- [ ] check which is the correct field for orientations (check tablet etc.?) on android
  display.getRotation() or configuration.getOrientation() ?
- [ ] can we get the device orientation as event just like in ios? (i.e. also facing top etc)
