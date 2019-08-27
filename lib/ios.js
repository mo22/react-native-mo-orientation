import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
export var Orientation;
(function (Orientation) {
    Orientation[Orientation["Portrait"] = 1] = "Portrait";
    Orientation[Orientation["PortraitUpsideDown"] = 2] = "PortraitUpsideDown";
    Orientation[Orientation["LandscapeRight"] = 3] = "LandscapeRight";
    Orientation[Orientation["LandscapeLeft"] = 4] = "LandscapeLeft";
})(Orientation || (Orientation = {}));
export var OrientationMask;
(function (OrientationMask) {
    OrientationMask[OrientationMask["Portrait"] = 2] = "Portrait";
    OrientationMask[OrientationMask["PortraitUpsideDown"] = 4] = "PortraitUpsideDown";
    OrientationMask[OrientationMask["LandscapeRight"] = 8] = "LandscapeRight";
    OrientationMask[OrientationMask["LandscapeLeft"] = 16] = "LandscapeLeft";
})(OrientationMask || (OrientationMask = {}));
export const Module = (Platform.OS === 'ios') ? NativeModules.ReactNativeMoOrientation : undefined;
export const Events = Module ? new NativeEventEmitter(NativeModules.ReactNativeMoOrientation) : undefined;
//# sourceMappingURL=ios.js.map