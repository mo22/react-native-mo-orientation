import { NativeModules, NativeEventEmitter, EmitterSubscription, Platform } from 'react-native';

export enum Orientation {
  Portrait = 1,
  PortraitUpsideDown = 2,
  LandscapeRight = 3,
  LandscapeLeft = 4,
}

export enum OrientationMask {
  Portrait = 2,
  PortraitUpsideDown = 4,
  LandscapeRight = 8,
  LandscapeLeft = 16,
}

export interface Module {
  initialOrientation: { deviceOrientation: Orientation; interfaceOrientation: Orientation; };
  startObservingOrientation(): void;
  stopObservingOrientation(): void;
  setOrientationMask(mask: OrientationMask): void;
  setOrientation(orientation: Orientation): void;
}

export interface OrientationEvent {
  deviceOrientation: Orientation;
  interfaceOrientation: Orientation;
}

export const Module = (Platform.OS === 'ios') ? NativeModules.ReactNativeMoOrientation as Module : undefined;

export const Events = Module ? new NativeEventEmitter(NativeModules.ReactNativeMoOrientation) as {
  addListener(eventType: 'ReactNativeMoOrientation', listener: (event: OrientationEvent) => void): EmitterSubscription;
} : undefined;
