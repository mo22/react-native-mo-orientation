import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
export var Orientation;
(function (Orientation) {
    Orientation[Orientation["Portrait"] = 0] = "Portrait";
    Orientation[Orientation["LandscapeLeft"] = 1] = "LandscapeLeft";
    Orientation[Orientation["PortraitUpsideDown"] = 2] = "PortraitUpsideDown";
    Orientation[Orientation["LandscapeRight"] = 3] = "LandscapeRight";
})(Orientation || (Orientation = {}));
export var RequestOrientation;
(function (RequestOrientation) {
    RequestOrientation[RequestOrientation["Unset"] = -2] = "Unset";
    RequestOrientation[RequestOrientation["Unspecified"] = -1] = "Unspecified";
    RequestOrientation[RequestOrientation["Landscape"] = 0] = "Landscape";
    RequestOrientation[RequestOrientation["Portrait"] = 1] = "Portrait";
    RequestOrientation[RequestOrientation["Sensor"] = 4] = "Sensor";
    RequestOrientation[RequestOrientation["SensorLandscape"] = 6] = "SensorLandscape";
    RequestOrientation[RequestOrientation["SensorPortrait"] = 7] = "SensorPortrait";
    RequestOrientation[RequestOrientation["ReverseLandscape"] = 8] = "ReverseLandscape";
    RequestOrientation[RequestOrientation["ReversePortrait"] = 9] = "ReversePortrait";
})(RequestOrientation || (RequestOrientation = {}));
export const Module = (Platform.OS === 'android') ? NativeModules.ReactNativeMoOrientation : undefined;
export const Events = Module ? new NativeEventEmitter(NativeModules.ReactNativeMoOrientation) : undefined;
//# sourceMappingURL=android.js.map