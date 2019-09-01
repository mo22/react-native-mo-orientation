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
- [ ] OrientationLock.allowed -- typing?
- [ ] android does not trigger orientation change between landscape left and right
- [ ] check which is the correct field for orientations (check tablet etc.?) on android
- [ ] swizzle delegate only if we want to set the orientation
- [ ] inline docs
