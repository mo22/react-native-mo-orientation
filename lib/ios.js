import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
export var Orientation;
(function (Orientation) {
    Orientation[Orientation["Portrait"] = 1] = "Portrait";
    Orientation[Orientation["PortraitUpsideDown"] = 2] = "PortraitUpsideDown";
    Orientation[Orientation["LandscapeLeft"] = 3] = "LandscapeLeft";
    Orientation[Orientation["LandscapeRight"] = 4] = "LandscapeRight";
})(Orientation || (Orientation = {}));
export var OrientationMask;
(function (OrientationMask) {
    OrientationMask[OrientationMask["Portrait"] = 2] = "Portrait";
    OrientationMask[OrientationMask["PortraitUpsideDown"] = 4] = "PortraitUpsideDown";
    OrientationMask[OrientationMask["LandscapeLeft"] = 8] = "LandscapeLeft";
    OrientationMask[OrientationMask["LandscapeRight"] = 16] = "LandscapeRight";
})(OrientationMask || (OrientationMask = {}));
export const Module = (Platform.OS === 'ios') ? NativeModules.ReactNativeMoOrientation : undefined;
export const Events = Module ? new NativeEventEmitter(NativeModules.ReactNativeMoOrientation) : undefined;
//# sourceMappingURL=ios.js.map