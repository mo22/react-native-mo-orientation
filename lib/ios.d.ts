import { EmitterSubscription } from 'react-native';
export declare enum Orientation {
    Portrait = 1,
    PortraitUpsideDown = 2,
    LandscapeLeft = 3,
    LandscapeRight = 4
}
export declare enum OrientationMask {
    Portrait = 2,
    PortraitUpsideDown = 4,
    LandscapeLeft = 8,
    LandscapeRight = 16
}
export interface Module {
    initialOrientation: {
        deviceOrientation: Orientation;
        interfaceOrientation: Orientation;
    };
    enableOrientationEvent(enable: boolean): void;
    setOrientationMask(mask: OrientationMask): void;
    setOrientation(orientation: Orientation): void;
}
export interface OrientationEvent {
    deviceOrientation: Orientation;
    interfaceOrientation: Orientation;
}
export declare const Module: Module | undefined;
export declare const Events: {
    addListener(eventType: "ReactNativeMoOrientation", listener: (event: OrientationEvent) => void): EmitterSubscription;
} | undefined;
