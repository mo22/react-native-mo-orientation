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
- On iOS the orientation lock is implemented by swizzeling the
  application:supportedInterfaceOrientationsForWindow: selector on the active
  app delegate. This is done only if setOrientation is ever called. This means
  that if you had that selector implemented it will not be called any more.

- On iPad/universal apps the orientation locking only works for full screen apps

- Android cannot handle orientation locks like portrait + landscapeleft. A
  console.warn will be given in dev mode.

## TODO
- [ ] check which is the correct field for orientations (check tablet etc.?) on android
  - display.getRotation() or configuration.getOrientation() ?
  - on galaxy tab and phones getRotation works out
