import { EmitterSubscription } from 'react-native';
export declare enum Orientation {
    Portrait = 0,
    LandscapeLeft = 1,
    PortraitUpsideDown = 2,
    LandscapeRight = 3
}
export declare enum RequestOrientation {
    Unset = -2,
    Unspecified = -1,
    Landscape = 0,
    Portrait = 1,
    Sensor = 4,
    SensorLandscape = 6,
    SensorPortrait = 7,
    ReverseLandscape = 8,
    ReversePortrait = 9
}
export interface Module {
    setVerbose(verbose: boolean): void;
    enableOrientationEvent(enable: boolean): void;
    setRequestedOrientation(orientation: RequestOrientation): void;
    getOrientation(): Promise<number>;
}
export interface OrientationEvent {
    rotation: number;
    orientation: number;
}
export declare const Module: Module | undefined;
export declare const Events: {
    addListener(eventType: 'ReactNativeMoOrientation', listener: (event: OrientationEvent) => void): EmitterSubscription;
} | undefined;
