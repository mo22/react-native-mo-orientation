# react-native-mo-orientation

Lets you vibrate your phone from react-native

## Usage

```ts
import { Vibrate } from 'react-native-mo-vibrate';

Vibrate.vibrate(Vibrate.Type.TAP);
```

## Advanced

```ts
import { Vibrate } from 'react-native-mo-vibrate';

if (Vibrate.android.Module) {
  Vibrate.android.Module.vibratePattern({
    pattern: [ 500, 100, 500 ],
    amplitude; [ 255, 127, 255 ],
    repeat: 3,
  });
}
```

## TODO

- [ ] example: base screen with switches to select allowed orientation
- [ ] example: show value of current orientation
- [ ] example: navigate to sub page with locked orientation
