import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from 'react-native';

export enum Orientation {
  Portrait = 0,
  LandscapeLeft = 1,
  PortraitUpsideDown = 2,
  LandscapeRight = 3,
}

export enum RequestOrientation {
  Unset = -2,
  Unspecified = -1,
  Landscape = 0,
  Portrait = 1,
  Sensor = 4,
  SensorLandscape = 6,
  SensorPortrait = 7,
  ReverseLandscape = 8,
  ReversePortrait = 9,
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

export const Module = (Platform.OS === 'android') ? NativeModules.ReactNativeMoOrientation as Module : undefined;

export const Events = Module ? new NativeEventEmitter(NativeModules.ReactNativeMoOrientation) as {
  addListener(eventType: 'ReactNativeMoOrientation', listener: (event: OrientationEvent) => void): EmitterSubscription;
} : undefined;
